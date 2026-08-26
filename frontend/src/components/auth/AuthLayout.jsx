function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen">
        <section className="relative hidden w-1/2 overflow-hidden border-r border-slate-800 bg-slate-950 lg:flex">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                <span className="text-lg font-bold text-white">A</span>
              </div>

              <span className="text-xl font-bold tracking-tight text-white">
                AetherAI
              </span>
            </div>

            <div className="max-w-xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-indigo-400">
                Enterprise AI Platform
              </p>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Turn your enterprise knowledge into intelligent action.
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Connect knowledge, automate workflows, and interact with your
                organization's information through a secure AI workspace.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Â© 2026 AetherAI. Enterprise AI Knowledge & Operations Copilot.
            </p>
          </div>
        </section>

        <section className="flex min-h-screen w-full items-center justify-center px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}

export default AuthLayout;
