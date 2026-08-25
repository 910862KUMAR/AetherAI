import {
  ArrowRight,
  Bot,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    "User";

  const quickActions = [
    {
      title: "Ask AetherAI",
      description: "Start an AI-powered conversation",
      icon: Sparkles,
      action: () => navigate("/chat"),
    },
    {
      title: "Upload documents",
      description: "Add knowledge to your workspace",
      icon: Upload,
      action: () => navigate("/documents"),
    },
    {
      title: "Search knowledge",
      description: "Find information across your data",
      icon: Search,
      action: () => navigate("/documents"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                AetherAI
              </p>

              <p className="text-xs text-slate-500">
                Enterprise AI Workspace
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/documents")}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-900 hover:text-white"
            >
              Documents
            </button>

            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-900 hover:text-white"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-black/10 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
                <Bot className="h-3.5 w-3.5" />
                AI Workspace
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Welcome to AetherAI
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-400 md:text-lg">
                Enterprise AI Knowledge & Operations Copilot
                for searching organizational knowledge,
                answering questions, and assisting with
                intelligent workflows.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                >
                  <Sparkles className="h-4 w-4" />
                  Ask AetherAI
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/documents")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  Manage knowledge
                </button>
              </div>
            </div>

            <div className="hidden lg:flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl border border-indigo-500/20 bg-indigo-500/10">
              <Bot className="h-16 w-16 text-indigo-400" />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Quick actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Common workspace operations
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={action.action}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-500/30 hover:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 ring-1 ring-slate-800">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-white">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-medium text-slate-400">
                Knowledge
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-white">
              Connected
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Your organizational documents
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-medium text-slate-400">
                AI Engine
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-emerald-400">
              Ready
            </p>

            <p className="mt-1 text-xs text-slate-600">
              RAG-powered assistance
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-medium text-slate-400">
                Workspace
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-emerald-400">
              Secure
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Signed in as {displayName}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;