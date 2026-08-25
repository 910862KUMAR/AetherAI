import {
  ArrowLeft,
  Bell,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const displayName =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    "User";

  const email = user?.email || "Not available";

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-white">
              Settings
            </h1>

            <p className="text-xs text-slate-500">
              Account and workspace preferences
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-indigo-400" />

                <div>
                  <h2 className="font-semibold text-white">
                    Profile
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your AetherAI account information
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Full name
                </label>

                <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  {displayName}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-600" />

                  <span className="text-sm text-slate-300">
                    {email}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-indigo-400" />

                <div>
                  <h2 className="font-semibold text-white">
                    Notifications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Control workspace notifications
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 p-6">
              <div>
                <p className="text-sm font-medium text-white">
                  Workspace notifications
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Receive important updates from AetherAI.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() =>
                  setNotifications((value) => !value)
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  notifications
                    ? "bg-indigo-600"
                    : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    notifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />

                <div>
                  <h2 className="font-semibold text-white">
                    Security
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Account security status
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-slate-500" />

                  <span className="text-sm text-slate-300">
                    Authentication
                  </span>
                </div>

                <span className="text-sm font-medium text-emerald-400">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />

                  <span className="text-sm text-slate-300">
                    Email verification
                  </span>
                </div>

                <span
                  className={`text-sm font-medium ${
                    user?.is_verified
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {user?.is_verified
                    ? "Verified"
                    : "Pending"}
                </span>
              </div>
            </div>
          </section>

          {saved && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Settings saved successfully.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              <Save className="h-4 w-4" />
              Save settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;