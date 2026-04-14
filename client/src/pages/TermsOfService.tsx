import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="text-slate-300">By using Vault Crawler, you agree to these terms. This page is a template and should be reviewed by legal counsel before production launch.</p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Account and Access</h2>
          <p className="text-slate-300">You are responsible for maintaining access to your connected account and wallet credentials. Unauthorized use of your credentials is your responsibility.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Virtual Currency</h2>
          <p className="text-slate-300">Vault Tokens are virtual in-game credits and may not be redeemable for real-world currency unless explicitly supported by law and platform policy.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Purchases</h2>
          <p className="text-slate-300">All purchases are final except where consumer protection law requires refunds. Fraudulent activity may result in suspension and purchase reversal.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Limitation of Liability</h2>
          <p className="text-slate-300">The service is provided as-is without warranties. The operators are not liable for indirect, incidental, or consequential damages to the extent allowed by law.</p>
        </section>

        <div className="pt-4 border-t border-slate-800">
          <Link to="/" className="text-cyan-300 hover:text-cyan-200">Return to Login</Link>
        </div>
      </div>
    </div>
  )
}
