import sources from '../data/sources.json';

export default function Sources() {
  return (
    <section id="sources" className="mt-14">
      <h2 className="h2">Sources</h2>
      <ul className="mt-4 grid gap-3 list-none p-0">
        {sources.map((s) => (
          <li key={s.id} className="card p-4 text-sm">
            <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
            <span className="muted"> · {s.publisher} · {s.date} · {s.type}</span>
            <p className="muted mt-1 mb-0">{s.supports}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm mt-4"><a className="underline" href="./aca-premium-check_sources.xlsx">Download the data, sources and method (.xlsx)</a></p>
    </section>
  );
}
