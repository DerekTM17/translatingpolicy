// "Does this apply to me?" logic. Pure functions, no storage, no network.
// Rules follow the CMS fact sheet for CMS-2454-IFC (June 1, 2026) and the
// Oct 29, 2026 court ruling on medical frailty. It gives likely answers only.

export const INCOME_THRESHOLD_2026 = 580; // federal minimum wage x 80 hours, per CMS
export const HOURS_PER_MONTH = 80;

export const EXEMPTIONS = [
  { key: 'pregnant', label: 'I am pregnant, or I recently gave birth and have postpartum coverage' },
  { key: 'caregiver', label: 'I am a parent or caretaker of a child 13 or younger, or I care for a person with a disability' },
  { key: 'frail', label: 'I have a disability, blindness, a substance use disorder, a disabling mental health condition, or a serious or complex medical condition' },
  { key: 'veteran', label: 'I am a veteran with a total disability rating' },
  { key: 'aian', label: 'I am American Indian or Alaska Native' },
  { key: 'foster', label: 'I was in foster care and now get Medicaid as a former foster youth' },
  { key: 'treatment', label: 'I am in a drug or alcohol treatment program' },
  { key: 'snaptanf', label: 'I already meet the TANF work rules, or I am in a SNAP household and not excused from SNAP work rules' },
  { key: 'jail', label: 'I am in jail or prison, or was recently released' },
];

export const ACTIVITIES = [
  { key: 'hours', label: 'I work, volunteer, or join a job program at least ' + HOURS_PER_MONTH + ' hours a month (a mix counts)' },
  { key: 'income', label: 'I earn at least $' + INCOME_THRESHOLD_2026 + ' a month' },
  { key: 'school', label: 'I go to school or job training at least half-time' },
];

const RULE_LINE =
  HOURS_PER_MONTH + ' hours a month of qualifying activities, at least half-time school, or at least $' +
  INCOME_THRESHOLD_2026 + ' in monthly income at the 2026 federal minimum wage';

const GRACE_DATE = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric',
});

function coverageTiming(st) {
  if (st.holdHarmless === 'yes') {
    const through = st.protectedThrough
      ? ' through ' + GRACE_DATE.format(new Date(st.protectedThrough + 'T00:00:00Z'))
      : ' during its grace period';
    return {
      code: 'protected',
      title: 'The rule likely applies, but your state plans to give you more time.',
      summary: "Your state can still check whether you meet the rule. Based on " + st.name +
        "’s reported plan, it won’t deny or end Medicaid solely for not meeting this rule" + through +
        ' if you otherwise qualify.',
    };
  }

  if (st.holdHarmless === 'no') {
    return {
      code: 'at_risk',
      title: 'The rule likely applies, and your coverage may be at risk.',
      summary: st.name + ' says it won’t use the grace period. Check with your state Medicaid agency for when the rule applies to your application or renewal.',
    };
  }

  return {
    code: 'timing_unknown',
    title: 'The rule likely applies. When it can affect your coverage isn’t confirmed here.',
    summary: 'We haven’t confirmed whether ' + st.name +
      ' will use the grace period. Checking whether you meet the rule and denying or ending coverage are separate. Check your state Medicaid notice for the timing that applies to you.',
  };
}

/**
 * @param {object} a answers
 * @param {string} a.state two letter code
 * @param {'under19'|'19to64'|'65plus'|''} a.age
 * @param {'yes'|'no'|'unsure'|''} a.medicare
 * @param {'adult'|'other'|'unsure'|''} a.group
 * @param {string[]} a.exemptions keys from EXEMPTIONS, plus 'unsure'
 * @param {string[]} a.activities keys from ACTIVITIES, plus 'unsure'
 * @param {Array<{code:string,name:string,coverage:string,holdHarmless:string,protectedThrough?:string}>} states
 */
export function evaluate(a, states) {
  const st = states.find((s) => s.code === a.state);
  if (!st || !a.age || !a.medicare || !a.group) {
    return { code: 'incomplete', title: 'Answer the questions above to see a result.', caveats: [] };
  }
  const caveats = [];
  if (st.coverage === 'waiver') {
    caveats.push(
      st.name + ' has not adopted the full Medicaid expansion. The rule reaches only adults covered through its waiver program, so check your notices closely.',
    );
  }

  if (st.coverage === 'none') {
    return {
      code: 'not_applicable',
      title: 'Likely does not apply: ' + st.name + ' is not required to run this rule.',
      summary: st.name + ' has not adopted the ACA Medicaid expansion and has no covered waiver group. The federal work rule only reaches adults in those groups.',
      caveats,
    };
  }
  if (a.age === 'under19' || a.age === '65plus') {
    return {
      code: 'not_applicable',
      title: 'Likely does not apply: the rule covers adults 19 to 64.',
      summary: 'People under 19 or 65 and older are outside the rule.',
      caveats,
    };
  }
  if (a.medicare === 'yes') {
    return {
      code: 'not_applicable',
      title: 'Likely does not apply: people on Medicare are outside the rule.',
      summary: 'The rule covers adults who are not entitled to or enrolled in Medicare.',
      caveats,
    };
  }
  if (a.group === 'other') {
    return {
      code: 'not_applicable',
      title: 'Likely does not apply: the rule targets the low-income adult group.',
      summary: 'If you get Medicaid for another reason, such as a disability, a pregnancy, or as a parent in a lower income group, the rule is not aimed at you. Your state notice will say which group you are in.',
      caveats,
    };
  }

  const ex = (a.exemptions || []).filter((k) => k !== 'unsure');
  if (ex.length > 0) {
    const steps = [
      'Your state may already know this from its records. If it asks, send proof such as a doctor note, a benefit letter, or a school or tribal record.',
    ];
    if (ex.includes('frail')) {
      steps.push(
        'Since an Oct 29, 2026 court ruling, being in one of the medically frail groups should be enough. You should not also have to prove the condition limits your ability to work. CMS says it will appeal.',
      );
    }
    return {
      code: 'exempt',
      title: 'Likely exempt. You probably do not have to report hours.',
      summary: 'You checked at least one group the law excuses from the rule.',
      steps,
      caveats: maybeUnsure(a, caveats),
    };
  }

  const act = (a.activities || []).filter((k) => k !== 'unsure');
  const unsureAny =
    (a.exemptions || []).includes('unsure') ||
    (a.activities || []).includes('unsure') ||
    a.medicare === 'unsure' ||
    a.group === 'unsure';

  if (act.length > 0) {
    return {
      code: 'meets',
      title: 'Likely covered by the rule, and you seem to meet it.',
      summary: 'You will probably have to show it: ' + RULE_LINE + '.',
      steps: [
        'Keep pay stubs, volunteer logs, or school enrollment records.',
        'New applicants must show at least one month before applying (states can ask for up to three). At renewal, states pick how many months to check.',
        'If you get a notice that you are out of compliance, you have 30 days to respond.',
      ],
      caveats: maybeUnsure(a, caveats),
    };
  }
  if (unsureAny) {
    return {
      code: 'unclear',
      title: 'Unclear. Some answers were "not sure".',
      summary: 'Check your latest Medicaid notice, or call your state Medicaid agency, to find out which group you are in and whether you are excused.',
      caveats,
    };
  }
  const timing = coverageTiming(st);
  return {
    ...timing,
    steps: [
      'Common ways to meet the rule: ' + RULE_LINE + '.',
      'Ask your state about short-term hardship exceptions. States can excuse people in a hospital or nursing home, in a disaster area, or in a county with high unemployment.',
      'Watch your mail. If you get a notice that you are out of compliance, you have 30 days to respond.',
      ...(timing.code === 'at_risk' ? ['If you lose coverage, you can reapply at any time.'] : []),
    ],
    caveats,
  };
}

function maybeUnsure(a, caveats) {
  if (a.medicare === 'unsure' || a.group === 'unsure') {
    return [...caveats, 'You were not sure about Medicare or your Medicaid group. Your state notice will confirm.'];
  }
  return caveats;
}
