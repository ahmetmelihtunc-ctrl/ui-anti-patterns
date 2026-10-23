export function Hero() {
  return (
    <section className="bg-slate-50 p-8">
      <h1 className="text-3xl font-semibold text-slate-900">Scan images before they reach the cluster</h1>
      <div className="rounded-md border border-slate-300 bg-white p-4">
        <p className="text-sm text-slate-700">Blocks images that carry vulnerabilities you marked as unacceptable.</p>
        <button className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2">Start a scan</button>
      </div>
    </section>
  );
}
