export default function Inventory() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/70">Inventory</p>
          <h1 className="mt-3 text-4xl font-semibold">Gear & Items</h1>
          <p className="mt-2 text-slate-400">Manage your current equipment, repair damaged gear, and prepare for your next run.</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
          <p className="text-lg font-semibold text-white">Inventory is coming online.</p>
          <p className="mt-4 text-slate-400">This space will show your equipped items, durability, and repair options for VaultCrawler.</p>
        </div>
      </div>
    </div>
  )
}
