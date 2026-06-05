import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Settings as SettingsIcon, Bell, Sparkles, Database, User, ShieldCheck,
  Command, Info, Sun, Moon, Check, Loader2, Zap, Download, Trash2, Lock,
  Mail, Eye, EyeOff, Brain, MessageSquareText, Ghost, BadgeCheck, ArrowUpRight,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useDebugStore from "../../store/debugStore";
import { useThemeStore } from "../../store/themeStore";
import { MANISH_LABS_URL } from "../../config/links";

export const ACCENTS = {
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  amber: "#f59e0b",
  zinc: "#71717a",
};

export const applyAccent = (accent) => {
  const hex = ACCENTS[accent] || ACCENTS.emerald;
  document.documentElement.style.setProperty("--accent", hex);
};

const TABS = [
  { key: "general", label: "General", icon: SettingsIcon },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "personalization", label: "Personalization", icon: Sparkles },
  { key: "data", label: "Data controls", icon: Database },
  { key: "account", label: "Account", icon: User },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "keyboard", label: "Keyboard", icon: Command },
  { key: "about", label: "About", icon: Info },
];

/* ── Small building blocks ───────────────────────────── */
const Row = ({ title, desc, children }) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-zinc-100 dark:border-zinc-800/70 last:border-0">
    <div className="min-w-0">
      <p className="text-[13.5px] font-semibold text-zinc-900 dark:text-white">{title}</p>
      {desc && <p className="text-[11.5px] text-zinc-500 mt-0.5 leading-snug">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ on, onClick, accent = false }) => (
  <button
    onClick={onClick}
    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
      on ? (accent ? "bg-amber-500" : "bg-emerald-500") : "bg-zinc-200 dark:bg-zinc-700"
    }`}
  >
    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
  </button>
);

const Segmented = ({ value, onChange, options }) => (
  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/70">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
          value === o.value
            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        {o.icon && <o.icon size={13} />}
        {o.label}
      </button>
    ))}
  </div>
);

const ComingSoon = () => (
  <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
    Soon
  </span>
);

const SaveBtn = ({ onClick, state }) => (
  <button
    onClick={onClick}
    disabled={state === "saving"}
    className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[12px] font-semibold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
  >
    {state === "saving" ? <Loader2 size={14} className="animate-spin" /> : state === "saved" ? <Check size={14} className="text-emerald-500" /> : null}
    {state === "saved" ? "Saved" : "Save"}
  </button>
);

/**
 * The unified "Control Center" — a ChatGPT-style Settings modal with a tab rail.
 * Profile-menu items (Settings / Personalization / Profile) open this on the right tab.
 */
const SettingsModal = ({ open, initialTab = "general", onClose }) => {
  const { user, updateProfile, logout } = useAuthStore();
  const { pastSessions, fetchSessions, deleteAllSessions } = useDebugStore();
  const { theme, setTheme } = useThemeStore();

  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({});
  const [pw, setPw] = useState({ current: "", next: "", confirm: "", show: false });
  const [saveState, setSaveState] = useState({}); // keyed by section
  const [error, setError] = useState(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const prefs = user?.preferences || {};
  const personalization = user?.personalization || {};

  // Hydrate local form whenever the modal (re)opens.
  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setError(null);
      setPw({ current: "", next: "", confirm: "", show: false });
      setForm({
        displayName: user?.displayName || "",
        accent: prefs.accent || "emerald",
        language: prefs.language || "auto",
        dictation: !!prefs.dictation,
        notifProduct: prefs.notifications?.product !== false,
        notifSecurity: prefs.notifications?.security !== false,
        aboutYou: personalization.aboutYou || "",
        responseStyle: personalization.responseStyle || "",
        responseMode: personalization.responseMode || "socratic",
        defaultDeepMode: !!prefs.defaultDeepMode,
        defaultBlogIdentity: prefs.defaultBlogIdentity || "name",
      });
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTab]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const flash = (section) => {
    setSaveState((s) => ({ ...s, [section]: "saved" }));
    setTimeout(() => setSaveState((s) => ({ ...s, [section]: undefined })), 1500);
  };

  // Persist a preferences patch immediately (used by toggles/swatches).
  const persistPrefs = async (patch) => {
    try {
      await updateProfile({ preferences: patch });
    } catch {
      setError("Couldn't save that change.");
    }
  };

  const saveSection = async (section, payload) => {
    setSaveState((s) => ({ ...s, [section]: "saving" }));
    setError(null);
    try {
      await updateProfile(payload);
      flash(section);
    } catch (err) {
      setSaveState((s) => ({ ...s, [section]: undefined }));
      setError(err.response?.data?.message || "Failed to save");
    }
  };

  const savePassword = async () => {
    setError(null);
    if (!pw.next) return setError("Enter a new password");
    if (pw.next !== pw.confirm) return setError("New passwords do not match");
    if (pw.next.length < 6) return setError("New password must be at least 6 characters");
    if (!pw.current) return setError("Enter your current password");
    setSaveState((s) => ({ ...s, password: "saving" }));
    try {
      await updateProfile({ currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "", confirm: "", show: false });
      flash("password");
    } catch (err) {
      setSaveState((s) => ({ ...s, password: undefined }));
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), conversations: pastSessions }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trace-conversations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wipeAll = async () => {
    await deleteAllSessions();
    setConfirmWipe(false);
  };

  const shortcuts = useMemo(() => ([
    { keys: ["Enter"], label: "Send message" },
    { keys: ["Shift", "Enter"], label: "New line" },
    { keys: ["Esc"], label: "Close this panel" },
    { keys: ["Ctrl", "K"], label: "Search history" },
  ]), []);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative w-full max-w-3xl h-[640px] max-h-[90vh] bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800 rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
              <h3 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-white">Settings</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Rail */}
              <div className="w-[180px] shrink-0 border-r border-zinc-100 dark:border-zinc-800/80 p-2 overflow-y-auto scrollbar-none hidden sm:block">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5 ${
                        active ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      <Icon size={15} />
                      <span className="text-[12.5px] font-semibold">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile tab bar */}
              <div className="sm:hidden absolute top-[57px] left-0 right-0 z-10 bg-white dark:bg-[#0f0f11] border-b border-zinc-100 dark:border-zinc-800/80 flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none">
                {TABS.map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap ${tab === t.key ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 pt-16 sm:pt-5">
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                    {error}
                  </div>
                )}

                {/* ── GENERAL ── */}
                {tab === "general" && (
                  <div>
                    <Row title="Appearance" desc="Choose how Trace looks to you.">
                      <Segmented
                        value={theme}
                        onChange={(v) => { setTheme(v); persistPrefs({ theme: v }); }}
                        options={[{ value: "light", label: "Light", icon: Sun }, { value: "dark", label: "Dark", icon: Moon }]}
                      />
                    </Row>
                    <Row title="Accent color" desc="Used across highlights and your avatar.">
                      <div className="flex items-center gap-2">
                        {Object.entries(ACCENTS).map(([name, hex]) => (
                          <button
                            key={name}
                            onClick={() => { set({ accent: name }); applyAccent(name); persistPrefs({ accent: name }); }}
                            style={{ backgroundColor: hex }}
                            className={`w-6 h-6 rounded-full transition-all ${form.accent === name ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0f0f11] ring-zinc-400 scale-110" : "hover:scale-110"}`}
                            data-tooltip={name}
                          />
                        ))}
                      </div>
                    </Row>
                    <Row title="Language" desc="Interface language for Trace.">
                      <select
                        value={form.language}
                        onChange={(e) => { set({ language: e.target.value }); persistPrefs({ language: e.target.value }); }}
                        className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </Row>
                    <Row title="Enable dictation" desc="Show a mic button in the chat composer.">
                      <Toggle on={form.dictation} onClick={() => { const v = !form.dictation; set({ dictation: v }); persistPrefs({ dictation: v }); }} />
                    </Row>
                  </div>
                )}

                {/* ── NOTIFICATIONS ── */}
                {tab === "notifications" && (
                  <div>
                    <Row title="Product updates" desc="New features, tips, and announcements.">
                      <Toggle on={form.notifProduct} onClick={() => { const v = !form.notifProduct; set({ notifProduct: v }); persistPrefs({ notifications: { product: v } }); }} />
                    </Row>
                    <Row title="Security alerts" desc="Important notices about your account.">
                      <Toggle on={form.notifSecurity} onClick={() => { const v = !form.notifSecurity; set({ notifSecurity: v }); persistPrefs({ notifications: { security: v } }); }} />
                    </Row>
                  </div>
                )}

                {/* ── PERSONALIZATION ── */}
                {tab === "personalization" && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">What should Trace know about you?</label>
                      <textarea
                        value={form.aboutYou} onChange={(e) => set({ aboutYou: e.target.value })} maxLength={1500} rows={3}
                        placeholder="e.g. I'm a backend engineer working in Node.js & Postgres. Keep answers concise."
                        className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-[13.5px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">How should Trace respond?</label>
                      <textarea
                        value={form.responseStyle} onChange={(e) => set({ responseStyle: e.target.value })} maxLength={1500} rows={2}
                        placeholder="e.g. Be direct, use code examples, mention edge cases."
                        className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-[13.5px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50 resize-none"
                      />
                    </div>
                    <Row title="Response mode" desc="How Trace delivers solutions.">
                      <Segmented
                        value={form.responseMode}
                        onChange={(v) => set({ responseMode: v })}
                        options={[{ value: "socratic", label: "Socratic", icon: Brain }, { value: "direct", label: "Direct", icon: MessageSquareText }]}
                      />
                    </Row>
                    <Row title="Start in Deep Mode" desc="Use your 1 daily advanced request by default.">
                      <Toggle accent on={form.defaultDeepMode} onClick={() => set({ defaultDeepMode: !form.defaultDeepMode })} />
                    </Row>
                    <Row title="Default blog identity" desc="How you're shown when publishing a new blog.">
                      <Segmented
                        value={form.defaultBlogIdentity}
                        onChange={(v) => set({ defaultBlogIdentity: v })}
                        options={[{ value: "name", label: "Name", icon: BadgeCheck }, { value: "anonymous", label: "Anonymous", icon: Ghost }]}
                      />
                    </Row>
                    <div className="flex justify-end pt-1">
                      <SaveBtn
                        state={saveState.personalization}
                        onClick={() => saveSection("personalization", {
                          personalization: { aboutYou: form.aboutYou, responseStyle: form.responseStyle, responseMode: form.responseMode },
                          preferences: { defaultDeepMode: form.defaultDeepMode, defaultBlogIdentity: form.defaultBlogIdentity },
                        })}
                      />
                    </div>
                  </div>
                )}

                {/* ── DATA CONTROLS ── */}
                {tab === "data" && (
                  <div>
                    <Row title="Export conversations" desc="Download all your conversations as a JSON file.">
                      <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[12px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                        <Download size={14} /> Export
                      </button>
                    </Row>
                    <Row title="Delete all conversations" desc="Permanently remove every debugging session. This cannot be undone.">
                      <button onClick={() => setConfirmWipe(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[12px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all">
                        <Trash2 size={14} /> Delete all
                      </button>
                    </Row>
                  </div>
                )}

                {/* ── ACCOUNT ── */}
                {tab === "account" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-lg" style={{ background: `linear-gradient(135deg, ${ACCENTS[form.accent] || ACCENTS.emerald}, #0891b2)` }}>
                        {user?.displayName?.[0] || "U"}
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">{user?.displayName}</p>
                        <p className="text-[11px] text-zinc-500">{user?.email}</p>
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{user?.plan || "free"}</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Display name</label>
                      <div className="flex gap-2">
                        <input value={form.displayName} onChange={(e) => set({ displayName: e.target.value })} className="flex-1 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500/50" />
                        <SaveBtn state={saveState.name} onClick={() => saveSection("name", { displayName: form.displayName })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input value={user?.email || ""} readOnly className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-zinc-500 cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500"><Lock size={13} /> Change password</div>
                      <div className="relative">
                        <input type={pw.show ? "text" : "password"} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="Current password" autoComplete="current-password" className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 pr-10 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50" />
                        <button type="button" onClick={() => setPw({ ...pw, show: !pw.show })} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">{pw.show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      </div>
                      <input type={pw.show ? "text" : "password"} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="New password" autoComplete="new-password" className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50" />
                      <div className="flex gap-2">
                        <input type={pw.show ? "text" : "password"} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="Confirm new password" autoComplete="new-password" className="flex-1 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50" />
                        <SaveBtn state={saveState.password} onClick={savePassword} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/70">
                      <div>
                        <p className="text-[13px] font-semibold text-rose-500">Log out</p>
                        <p className="text-[11px] text-zinc-500">Sign out of this device.</p>
                      </div>
                      <button onClick={() => { logout(); window.location.href = "/"; }} className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[12px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all">
                        Log out
                      </button>
                    </div>
                  </div>
                )}

                {/* ── SECURITY ── */}
                {tab === "security" && (
                  <div>
                    <Row title="Multi-factor authentication" desc="Add an extra layer of protection when you log in.">
                      <ComingSoon />
                    </Row>
                    <Row title="Active sessions" desc="See and revoke devices signed into your account.">
                      <ComingSoon />
                    </Row>
                    <Row title="Password" desc="Update your password from the Account tab.">
                      <button onClick={() => setTab("account")} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[12px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Go to Account</button>
                    </Row>
                  </div>
                )}

                {/* ── KEYBOARD ── */}
                {tab === "keyboard" && (
                  <div>
                    {shortcuts.map((s, i) => (
                      <Row key={i} title={s.label}>
                        <div className="flex items-center gap-1.5">
                          {s.keys.map((k) => (
                            <kbd key={k} className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">{k}</kbd>
                          ))}
                        </div>
                      </Row>
                    ))}
                  </div>
                )}

                {/* ── ABOUT ── */}
                {tab === "about" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950">
                        <Zap size={22} className="fill-current" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">Trace</p>
                        <p className="text-[11px] text-zinc-500">
                          v2.5.0 · by{" "}
                          <a href={MANISH_LABS_URL} target="_blank" rel="noreferrer" className="font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            Manish Labs
                          </a>
                        </p>
                      </div>
                    </div>
                    <Row title="Manish Labs" desc="Trace is part of a wider ecosystem of tools — explore the hub.">
                      <a href={MANISH_LABS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[12px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                        Visit <ArrowUpRight size={13} />
                      </a>
                    </Row>
                    <Row title="App Guide" desc="Learn how to get the most from Trace.">
                      <a href="/guide" className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[12px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Open</a>
                    </Row>
                    <Row title="Report a bug" desc="Found something off? Let us know.">
                      <a href="mailto:support@manishlabs.com?subject=Trace%20Bug%20Report" className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[12px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Email us</a>
                    </Row>
                    <p className="text-[10px] text-zinc-400 pt-2">"Simplifying the way we solve software errors."</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Wipe confirmation */}
          <AnimatePresence>
            {confirmWipe && (
              <div className="absolute inset-0 z-[2100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmWipe(false)} className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="relative w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-7 shadow-2xl space-y-5">
                  <div className="w-14 h-14 rounded-[20px] bg-rose-500/10 flex items-center justify-center text-rose-500"><Trash2 size={24} /></div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight">Delete all conversations?</h3>
                    <p className="text-[13px] font-medium text-zinc-500 leading-relaxed">Every debugging session will be permanently deleted. Published blogs are kept.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmWipe(false)} className="flex-1 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-[12px] font-semibold">Cancel</button>
                    <button onClick={wipeAll} className="flex-1 py-3 rounded-2xl bg-rose-600 text-white text-[12px] font-semibold uppercase tracking-widest shadow-lg shadow-rose-600/20">Delete all</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SettingsModal;
