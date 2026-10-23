export function Hero() {
  return (
    <section className="bg-gradient-to-r from-purple-500 to-blue-500">
      <span className="rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-widest">New release</span>
      <h1 className="bg-clip-text text-transparent font-mono">Unlock your potential</h1>
      <div className="rounded-xl border-l-4 border-blue-500 shadow-2xl backdrop-blur-md p-[13px]">
        <p className="text-[10px] text-gray-400 bg-white">Trusted by 10,000+ teams</p>
        <button className="hover:opacity-80">Get started {"→"}</button>
      </div>
    </section>
  );
}
