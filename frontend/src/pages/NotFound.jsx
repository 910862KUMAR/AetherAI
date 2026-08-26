import {
  ArrowLeft,
  Home,
  SearchX,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <main className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-500/20 bg-indigo-500/10">
          <SearchX className="h-9 w-9 text-indigo-400" />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          The page you are looking for does not exist or may
          have been moved to another location.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Home className="h-4 w-4" />
            Go to dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-700">
          <Sparkles className="h-3.5 w-3.5" />
          AetherAI Enterprise AI Knowledge & Operations Copilot
        </div>
      </main>
    </div>
  );
}

export default NotFound;
