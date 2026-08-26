import {
  Activity,
  ArrowUpRight,
  Bot,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getDashboardStats } from "../api/dashboardApi";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    documents: {
      count: 0,
      processed: 0,
      storage_bytes: 0,
    },
    conversations: {
      count: 0,
    },
    ai_requests: {
      count: 0,
    },
    knowledge: {
      usage_percent: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardStats = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDashboardStats();

        if (isMounted) {
          setStats(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.detail ||
              "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatStorage = (bytes) => {
    if (!bytes || bytes <= 0) {
      return "0 MB";
    }

    const megabytes = bytes / (1024 * 1024);

    if (megabytes < 1) {
      return `${Math.round(bytes / 1024)} KB`;
    }

    if (megabytes < 1024) {
      return `${megabytes.toFixed(1)} MB`;
    }

    return `${(megabytes / 1024).toFixed(1)} GB`;
  };

  const statsCards = [
    {
      title: "Documents",
      value: isLoading
        ? "..."
        : stats.documents.count.toLocaleString(),
      description: `${stats.documents.processed} processed`,
      icon: FileText,
    },
    {
      title: "Conversations",
      value: isLoading
        ? "..."
        : stats.conversations.count.toLocaleString(),
      description: "AI conversations",
      icon: MessageSquare,
    },
    {
      title: "AI Requests",
      value: isLoading
        ? "..."
        : stats.ai_requests.count.toLocaleString(),
      description: "Messages processed",
      icon: Bot,
    },
    {
      title: "Knowledge Usage",
      value: isLoading
        ? "..."
        : `${stats.knowledge.usage_percent}%`,
      description: `${formatStorage(
        stats.documents.storage_bytes
      )} stored`,
      icon: TrendingUp,
    },
  ];

  const quickActions = [
    {
      title: "Ask AetherAI",
      description: "Ask questions about your documents",
      icon: Sparkles,
      path: "/chat",
    },
    {
      title: "Upload documents",
      description: "Add knowledge to your workspace",
      icon: Upload,
      path: "/documents",
    },
    {
      title: "Search knowledge",
      description: "Search your uploaded documents",
      icon: Search,
      path: "/knowledge",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white">
                AetherAI
              </h1>

              <p className="text-xs text-slate-500">
                AI Knowledge & Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="hidden rounded-xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white sm:flex sm:items-center sm:gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
              aria-label="Open settings"
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
        {/* WELCOME */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />

                <span className="text-sm font-medium text-emerald-400">
                  Workspace online
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Welcome back,{" "}
                <span className="text-indigo-400">
                  {user?.fullName?.split(" ")[0] || "there"}
                </span>
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Your enterprise AI workspace is ready. Chat with
                AetherAI, search your document knowledge, manage
                documents, and operate your AI workflows from one place.
              </p>
            </div>

            {/* GENERAL AI ASSISTANT */}
            <button
              type="button"
              onClick={() => navigate("/assistant")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New AI conversation
            </button>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
                    <Icon className="h-5 w-5 text-indigo-400" />
                  </div>

                  <button
                    type="button"
                    className="text-slate-600 transition hover:text-slate-300"
                    aria-label={`More options for ${stat.title}`}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* MAIN GRID */}
        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* GENERAL AI ASSISTANT */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      AI Assistant
                    </h3>

                    <p className="text-xs text-slate-500">
                      General AI assistance
                    </p>
                  </div>
                </div>
              </div>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                Ready
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <div className="mx-auto flex max-w-lg flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-500/20">
                  <Bot className="h-7 w-7 text-indigo-400" />
                </div>

                <h4 className="mt-5 text-lg font-semibold text-white">
                  Talk to AetherAI
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ask questions, get explanations, write code,
                  brainstorm ideas, and work with your AI assistant.
                  This chat does not search your uploaded documents.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/assistant")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  <MessageSquare className="h-4 w-4" />
                  Open AI Assistant
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div>
              <h3 className="font-semibold text-white">
                Quick actions
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Common workspace operations
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => navigate(action.path)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-left transition hover:border-indigo-500/30 hover:bg-slate-950/80"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 transition group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10">
                      <Icon className="h-5 w-5 text-slate-400 transition group-hover:text-indigo-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        {action.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {action.description}
                      </p>
                    </div>

                    <ArrowUpRight className="h-4 w-4 text-slate-700 transition group-hover:text-indigo-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SYSTEM STATUS */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  System status
                </h3>

                <p className="text-xs text-slate-500">
                  AetherAI platform services
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-xs text-slate-400">
                    API
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-white">
                  Operational
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-xs text-slate-400">
                    Database
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-white">
                  Connected
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-xs text-slate-400">
                    AI Engine
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-white">
                  Ready
                </p>
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Workspace security
                </h3>

                <p className="text-xs text-slate-500">
                  Account and access information
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-500">
                  Account status
                </span>

                <span className="text-sm font-medium text-emerald-400">
                  {user?.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-sm text-slate-500">
                  Email verification
                </span>

                <span className="text-sm font-medium text-slate-300">
                  {user?.isVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Workspace access
                </span>

                <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                  <Users className="h-4 w-4" />
                  Authorized
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-10 border-t border-slate-800/80 pt-6">
          <div className="flex flex-col justify-between gap-3 text-xs text-slate-600 sm:flex-row">
            <p>
              Â© 2026 AetherAI. Enterprise AI Knowledge &
              Operations Copilot.
            </p>

            <p>Secure enterprise workspace</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;



