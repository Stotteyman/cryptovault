import { Link } from 'react-router-dom'

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        <h1 className="text-3xl font-semibold">Legal Disclaimer</h1>
        <p className="text-slate-300">This page is a template for operational and legal risk disclosures and should be validated by legal counsel.</p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">No Financial Advice</h2>
          <p className="text-slate-300">Vault Crawler is an entertainment product. Nothing in the app constitutes investment, legal, tax, or financial advice.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Digital Asset Risk</h2>
          <p className="text-slate-300">Blockchain transactions and digital assets involve market and technical risks, including volatility, irreversible transfers, and potential loss of access.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Service Availability</h2>
          <p className="text-slate-300">Uptime is not guaranteed. Features, prices, and reward systems may change at any time to maintain game balance and platform security.</p>
        </section>

        <div className="pt-4 border-t border-slate-800">
          <Link to="/" className="text-cyan-300 hover:text-cyan-200">Return to Login</Link>
        </div>
      </div>
    </div>
  )
}
