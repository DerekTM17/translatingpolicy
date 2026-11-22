import { useMemo, useState } from 'react';
import states from '../data/states.json';
import { ACTIVITIES, EXEMPTIONS, evaluate } from '../lib/checker.js';
import { HH_LABELS } from './StateMap.jsx';

const EMPTY = { state: '', age: '', medicare: '', group: '', exemptions: [], activities: [] };

const TONE = {
  not_applicable: 'tone-ok',
  exempt: 'tone-ok',
  meets: 'tone-meets',
  unclear: 'tone-unclear',
  at_risk: 'tone-risk',
  incomplete: 'tone-none',
};

function Radio({ name, value, current, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 opt px-2 py-1.5">
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} className="mt-1" />
      <span>{children}</span>
    </label>
  );
}

function Checks({ items, values, onChange, unsureLabel }) {
  const toggle = (key) => {
    let next = values.includes(key) ? values.filter((k) => k !== key) : [...values, key];
    if (key === 'unsure' && next.includes('unsure')) next = ['unsure'];
    else next = next.filter((k) => k !== 'unsure' || key === 'unsure');
    onChange(next);
  };
  return (
    <div className="space-y-1">
      {items.map((it) => (
        <label key={it.key} className="flex cursor-pointer items-start gap-2 opt px-2 py-1.5">
          <input type="checkbox" checked={values.includes(it.key)} onChange={() => toggle(it.key)} className="mt-1" />
          <span>{it.label}</span>
        </label>
      ))}
      <label className="flex cursor-pointer items-start gap-2 opt px-2 py-1.5">
        <input type="checkbox" checked={values.includes('unsure')} onChange={() => toggle('unsure')} className="mt-1" />
        <span className="muted">{unsureLabel}</span>
      </label>
    </div>
  );
}

export default function Checker() {
  const [a, setA] = useState(EMPTY);
  const set = (k) => (v) => setA((prev) => ({ ...prev, [k]: v }));
  const result = useMemo(() => evaluate(a, states), [a]);
  const st = states.find((s) => s.code === a.state);
  const covered = st && st.coverage !== 'none';
  const showRest = covered && a.age === '19to64' && a.medicare && a.medicare !== 'yes' && a.group && a.group !== 'other';

  return (
    <section id="checker" aria-labelledby="checker-h" className="mt-14">
      <h2 id="checker-h" className="h2">Does this apply to me?</h2>
      <p className="mt-2 max-w-2xl muted">
        Answer a few questions. Nothing you pick is saved or sent anywhere; it all stays in your browser. This is a guide, not legal advice. Your state Medicaid agency has the final word.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        <form className="card space-y-6 p-5" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend className="font-semibold">1. Where do you live?</legend>
            <select
              value={a.state}
              onChange={(e) => set('state')(e.target.value)}
              className="focus-ring mt-2 w-full border rule bg-transparent px-3 py-2"
              aria-label="State"
            >
              <option value="">Pick your state</option>
              {[...states].sort((x, y) => x.name.localeCompare(y.name)).map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <legend className="font-semibold">2. How old are you?</legend>
            <div className="mt-1 grid sm:grid-cols-3">
              <Radio name="age" value="under19" current={a.age} onChange={set('age')}>Under 19</Radio>
              <Radio name="age" value="19to64" current={a.age} onChange={set('age')}>19 to 64</Radio>
              <Radio name="age" value="65plus" current={a.age} onChange={set('age')}>65 or older</Radio>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-semibold">3. Do you have Medicare?</legend>
            <div className="mt-1 grid sm:grid-cols-3">
              <Radio name="medicare" value="no" current={a.medicare} onChange={set('medicare')}>No</Radio>
              <Radio name="medicare" value="yes" current={a.medicare} onChange={set('medicare')}>Yes</Radio>
              <Radio name="medicare" value="unsure" current={a.medicare} onChange={set('medicare')}>Not sure</Radio>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-semibold">4. Why do you get Medicaid?</legend>
            <div className="mt-1 space-y-1">
              <Radio name="group" value="adult" current={a.group} onChange={set('group')}>
                I qualify as a low-income adult (often called the adult or expansion group)
              </Radio>
              <Radio name="group" value="other" current={a.group} onChange={set('group')}>
                For another reason, like a disability, a pregnancy, or as a parent in a lower income group
              </Radio>
              <Radio name="group" value="unsure" current={a.group} onChange={set('group')}>Not sure</Radio>
            </div>
          </fieldset>

          {showRest && (
            <>
              <fieldset>
                <legend className="font-semibold">5. Do any of these describe you?</legend>
                <p className="text-sm muted">Check all that apply. Any one of these likely excuses you.</p>
                <div className="mt-2">
                  <Checks items={EXEMPTIONS} values={a.exemptions} onChange={set('exemptions')} unsureLabel="Not sure if any of these fit me" />
                </div>
              </fieldset>
              <fieldset>
                <legend className="font-semibold">6. In a typical month, do you do any of these?</legend>
                <div className="mt-2">
                  <Checks items={ACTIVITIES} values={a.activities} onChange={set('activities')} unsureLabel="Not sure" />
                </div>
              </fieldset>
            </>
          )}

          <button type="button" onClick={() => setA(EMPTY)} className="focus-ring text-sm font-semibold text-accent underline underline-offset-4">
            Start over
          </button>
        </form>

        <div aria-live="polite" className="lg:sticky lg:top-6 lg:self-start">
          <div className={'card border-l-8 p-5 ' + (TONE[result.code] || '')}>
            <p className="label muted">Your likely result</p>
            <p className="mt-1 text-xl font-bold">{result.title}</p>
            {result.summary && <p className="mt-2">{result.summary}</p>}
            {result.steps && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {result.steps.map((s) => <li key={s}>{s}</li>)}
              </ul>
            )}
            {result.caveats?.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm muted">
                {result.caveats.map((c) => <li key={c}>{c}</li>)}
              </ul>
            )}
            {covered && (
              <div className="mt-4 border-t rule pt-3 text-sm">
                <p className="font-semibold">{st.name}: {HH_LABELS[st.holdHarmless]}</p>
                <p className="mt-1 muted">{st.note}</p>
                {st.early && <p className="mt-1 muted">{st.early}</p>}
                <p className="mt-2 muted">Questions about your case? Call your state Medicaid agency. The number is on your Medicaid card and on your notices.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
