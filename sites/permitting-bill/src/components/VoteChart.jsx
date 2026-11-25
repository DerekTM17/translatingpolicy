import { useMemo } from 'react';
import { scaleLinear } from 'd3';
import { formatDate, yeaShare } from '../lib.js';

// One row per Senate roll call: yea, nay and not voting out of 100 seats.
// Bars are HTML so labels stay readable on phones; d3's scale sets their widths.
// Yea is filled, nay is outlined, not voting is the empty gap, so the chart reads without color.
export default function VoteChart({ votes }) {
  const x = useMemo(() => scaleLinear().domain([0, 100]).range([0, 100]), []);
  return (
    <figure className="votes">
      <ol className="vote-rows" aria-label="Senate roll call votes on the permitting bill">
        <li className="half" aria-hidden="true" style={{ left: `${x(50)}%` }}><i>50</i></li>
        {votes.map((v) => (
          <li key={v.roll} className={v.roll === 270 ? 'final' : ''}>
            <div className="row-head">
              <span className="row-label">{formatDate(v.date, { month: 'short', day: 'numeric' })} · {v.short}</span>
              <span className="row-num">{v.yea} to {v.nay}</span>
            </div>
            <div className="bar" role="img" aria-label={`${v.yea} yea, ${v.nay} nay, ${v.notVoting} not voting`}>
              <span className="yea" style={{ width: `${x(v.yea)}%` }} />
              <span className="nay" style={{ width: `${x(v.nay)}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <figcaption>
        <span className="key"><i className="k-yea" /> Yea</span>
        <span className="key"><i className="k-nay" /> Nay</span>
        <span className="key">Gap at right: not voting</span>
      </figcaption>
      <table className="vote-table">
        <thead>
          <tr><th>Roll call</th><th>Date</th><th>Question</th><th>Yea</th><th>Nay</th><th>Not voting</th><th>Yea share</th></tr>
        </thead>
        <tbody>
          {votes.map((v) => (
            <tr key={v.roll}>
              <td><a className="src mono" href={v.url} target="_blank" rel="noreferrer">{v.roll}</a></td>
              <td>{formatDate(v.date, { month: 'short', day: 'numeric' })}</td>
              <td>{v.question}</td>
              <td className="n">{v.yea}</td>
              <td className="n">{v.nay}</td>
              <td className="n">{v.notVoting}</td>
              <td className="n">{yeaShare(v)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
