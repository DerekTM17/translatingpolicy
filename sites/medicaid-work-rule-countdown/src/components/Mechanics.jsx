const ITEMS = [
  {
    q: 'Who exactly is covered?',
    a: 'Adults 19 to 64 who get Medicaid through the ACA adult (expansion) group, or through certain waivers that cover similar adults, and who are not pregnant and not on Medicare. CMS counts 43 states and DC that cover these groups. Territories are not included.',
  },
  {
    q: 'What counts toward the 80 hours?',
    a: 'Paid work, community service, a work program, or school or job training at least half-time. A mix that adds up to 80 hours in a month works. So does earning at least the federal minimum wage times 80 hours, which CMS puts at $580 a month in 2026. Seasonal workers can average their pay over the past 6 months.',
  },
  {
    q: 'How many months do I have to prove?',
    a: 'If you apply, at least one month before the month you apply. States can ask for up to three months in a row. At renewal, states choose how many months between renewals to check. States check at application and renewal, and can choose to check more often.',
  },
  {
    q: 'What if my state says I did not meet it?',
    a: 'The state must send a notice and give you 30 days to show you met the rule or that you are excused. After that, it can deny or end coverage. You can reapply at any time.',
  },
  {
    q: 'What are the optional hardship exceptions?',
    a: 'States may excuse people for a short time if they are getting inpatient hospital or nursing home care, live in a county with a federal disaster declaration, live in a county with unemployment at or above 8% or 1.5 times the national rate, or must travel far for care for a serious condition. Each state decides which of these to offer.',
  },
  {
    q: 'What did the court change?',
    a: 'On Oct 29, 2026, a federal court in Massachusetts (Massachusetts v. Oz) threw out a CMS add-on that made people in one of the five medically frail groups also prove the condition seriously limits their ability to meet the 80 hours. Sources differ on whether the order covers every state or only the 25 states and DC that sued. The rest of the rule, including the January start, stands. CMS says it will appeal.',
  },
  {
    q: 'What is the grace period, exactly?',
    a: 'CMS letter SMD 26-006 (Nov 13, 2026) lets a state keep checking people from January but not deny or end coverage just for this rule on applications and renewals through June 30, 2027. States ask for it in their implementation plans, and CMS must approve. It does not pause any other eligibility rule.',
  },
  {
    q: 'Can a state get more time?',
    a: 'The law lets HHS give a state that shows a good faith effort an exemption that ends no later than Dec 31, 2028. That is a different tool from the grace period.',
  },
];

export default function Mechanics() {
  return (
    <section id="mechanics" aria-labelledby="mech-h" className="mt-16">
      <h2 id="mech-h" className="h2">How the rule works</h2>
      <p className="mt-2 max-w-2xl muted">The details, for caseworkers, reporters, and anyone who wants the mechanics.</p>
      <div className="mt-6 space-y-3">
        {ITEMS.map((it) => (
          <details key={it.q} className="card group p-4">
            <summary className="focus-ring cursor-pointer list-none font-semibold">
              <span className="mr-2 inline-block text-accent transition-transform group-open:rotate-90">&#9656;</span>
              {it.q}
            </summary>
            <p className="mt-2 max-w-3xl">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
