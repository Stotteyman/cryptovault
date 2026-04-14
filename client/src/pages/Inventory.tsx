export default function Inventory() {
  const sections = [
    {
      title: 'Equipped Gear',
      description: 'View what your active character is wearing and swap loadouts.',
      items: ['Weapon Slot', 'Armor Slot', 'Accessory Slot'],
    },
    {
      title: 'Consumables',
      description: 'Track potions, boosts, and one-time utility items.',
      items: ['Health Potions', 'Dungeon Keys', 'Boost Tickets'],
    },
    {
      title: 'Crafting & Materials',
      description: 'Manage salvage parts and upgrade materials for future systems.',
      items: ['Metal Scraps', 'Core Shards', 'Rune Dust'],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/70">Inventory</p>
          <h1 className="mt-3 text-4xl font-semibold">Gear & Items</h1>
          <p className="mt-2 text-slate-400">Manage your current equipment, repair damaged gear, and prepare for your next run.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
              <p className="text-lg font-semibold text-white">{section.title}</p>
              <p className="mt-3 text-sm text-slate-400">{section.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {section.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Inventory Notes</p>
          <p className="mt-3 text-slate-400">
            Inventory is now structured as a dedicated menu. Persistent item acquisition and equip actions will plug into these sections as shop and dungeon drops expand.
          </p>
        </div>
      </div>
    </div>
  )
}
