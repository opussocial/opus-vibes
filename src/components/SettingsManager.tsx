import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Settings, Plus, Trash2, Globe, User, Database, Eye, X, Save, 
  AlertCircle, ChevronRight, Info, Search, Filter, Activity, ToggleLeft, ToggleRight, Shield, Palette
} from "lucide-react";
import { ElementType, User as UserType } from "../types";
import { Badge } from "./common/Badge";

interface SettingsManagerProps {
  types: ElementType[];
  currentUser: UserType | null;
  hasPermission: (perm: string) => boolean;
  initialScope?: Scope;
}

type Scope = "global" | "type" | "user" | "features";

export const SettingsManager = ({ types, currentUser, hasPermission, initialScope = "global" }: SettingsManagerProps) => {
  const [scope, setScope] = useState<Scope>(initialScope);
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: "", value: "" });
  const [viewingSetting, setViewingSetting] = useState<{ key: string, value: any } | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    setScope(initialScope);
  }, [initialScope]);

  useEffect(() => {
    if (hasPermission("manage_users")) {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(err => console.error("Error fetching users:", err));
    }
  }, [hasPermission]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      if (scope === "features") {
        const res = await fetch("/api/features");
        const data = await res.json();
        setFeatures(data);
      } else {
        let url = "/api/settings?";
        if (scope === "type" && selectedTypeId) url += `type_id=${selectedTypeId}`;
        if (scope === "user" && selectedUserId) url += `user_id=${selectedUserId}`;
        if (scope === "user" && !selectedUserId && currentUser) url += `user_id=${currentUser.id}`;

        const res = await fetch(url);
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [scope, selectedTypeId, selectedUserId]);

  const toggleFeature = async (name: string, current: boolean) => {
    // Validation for homepage_enabled
    if (name === "homepage_enabled" && current === true) {
      const homeElement = settings["home_element"];
      if (!homeElement) {
        alert("Cannot disable default homepage unless 'home_element' is set in Global settings.");
        return;
      }
    }

    try {
      const res = await fetch(`/api/features/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !current })
      });
      if (res.ok) {
        fetchSettings();
      }
    } catch (err) {
      console.error("Error toggling feature:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedValue;
      try {
        parsedValue = JSON.parse(newSetting.value);
      } catch (e) {
        parsedValue = newSetting.value;
      }

      const body: any = {
        value: parsedValue
      };
      if (scope === "type") body.type_id = selectedTypeId;
      if (scope === "user") body.user_id = selectedUserId || currentUser?.id;

      const res = await fetch(`/api/settings/${newSetting.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setIsCreating(false);
        setNewSetting({ key: "", value: "" });
        fetchSettings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create setting");
      }
    } catch (err) {
      console.error("Error creating setting:", err);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) return;

    try {
      let url = `/api/settings/${key}?`;
      if (scope === "type" && selectedTypeId) url += `type_id=${selectedTypeId}`;
      if (scope === "user" && selectedUserId) url += `user_id=${selectedUserId}`;
      if (scope === "user" && !selectedUserId && currentUser) url += `user_id=${currentUser.id}`;

      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        fetchSettings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete setting");
      }
    } catch (err) {
      console.error("Error deleting setting:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="text-marine" size={32} />
            Configuration Manager
          </h2>
          <p className="text-zinc-500 mt-1">Manage global, type-level, and user-level settings.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSettings}
            className="p-3 text-zinc-400 hover:text-marine hover:bg-zinc-100 rounded-2xl transition-all"
            title="Refresh Settings"
          >
            <Activity size={20} />
          </button>
          {scope !== "features" && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-6 py-3 bg-marine text-brand-yellow rounded-2xl font-bold hover:bg-marine-light transition-all shadow-lg"
            >
              <Plus size={20} />
              New Setting
            </button>
          )}
        </div>
      </div>

      {/* Scope Selector */}
      <div className="flex flex-wrap gap-2 p-1 bg-zinc-100 rounded-2xl w-fit">
        <button
          onClick={() => setScope("global")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            scope === "global" ? "bg-white text-marine shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Globe size={18} />
          Global
        </button>
        <button
          onClick={() => setScope("type")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            scope === "type" ? "bg-white text-marine shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Database size={18} />
          Schema Type
        </button>
        <button
          onClick={() => setScope("user")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
            scope === "user" ? "bg-white text-marine shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <User size={18} />
          User
        </button>
        {hasPermission("manage_types") && (
          <button
            onClick={() => setScope("features")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              scope === "features" ? "bg-white text-marine shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Shield size={18} />
            Features
          </button>
        )}
      </div>

      {scope === "global" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Palette className="text-marine" size={24} />
              <h3 className="text-lg font-bold">Active Theme</h3>
            </div>
            <p className="text-sm text-zinc-500">Select the active theme for your public catalog.</p>
            <div className="flex gap-3">
              <select
                value={settings["active_theme"] || "default"}
                onChange={async (e) => {
                  const val = e.target.value;
                  await fetch(`/api/settings/active_theme`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ value: val })
                  });
                  fetchSettings();
                }}
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marine/5 font-bold text-marine"
              >
                <option value="default">Default Theme (Modern)</option>
                {/* Future themes can be added here */}
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="text-marine" size={24} />
              <h3 className="text-lg font-bold">Home Element</h3>
            </div>
            <p className="text-sm text-zinc-500">The element displayed on the root URL.</p>
            <div className="flex gap-3">
              <input 
                type="text"
                value={settings["home_element"] || ""}
                readOnly
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {scope === "type" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <Filter size={20} className="text-zinc-400" />
          <span className="text-sm font-bold text-zinc-700">Select Type:</span>
          <select
            value={selectedTypeId || ""}
            onChange={e => setSelectedTypeId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marine/5"
          >
            <option value="">Select a type...</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </motion.div>
      )}

      {scope === "user" && hasPermission("manage_users") && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <Filter size={20} className="text-zinc-400" />
          <span className="text-sm font-bold text-zinc-700">Select User:</span>
          <select
            value={selectedUserId || ""}
            onChange={e => setSelectedUserId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marine/5"
          >
            <option value="">Current User ({currentUser?.username})</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.role_name})</option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Settings List */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        {scope === "features" ? (
          <>
            <div className="grid grid-cols-12 gap-4 p-4 bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <div className="col-span-8">Feature Name</div>
              <div className="col-span-4 text-right">Status</div>
            </div>
            <div className="divide-y divide-zinc-50">
              {Object.entries(features).map(([name, enabled]) => (
                <div key={name} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-50/50 transition-colors group">
                  <div className="col-span-8">
                    <div className="font-mono text-sm font-bold text-zinc-900">{name}</div>
                    <p className="text-xs text-zinc-400">Toggle this system-wide feature flag.</p>
                  </div>
                  <div className="col-span-4 flex justify-end">
                    <button
                      onClick={() => toggleFeature(name, !!enabled)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                        enabled 
                          ? "bg-green-50 text-green-600 hover:bg-green-100" 
                          : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                      }`}
                    >
                      {enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      {enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 p-4 bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <div className="col-span-4">Key</div>
              <div className="col-span-6">Value Preview</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-zinc-400 italic">Loading settings...</div>
            ) : Object.keys(settings).length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic">No settings found for this scope.</div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-50/50 transition-colors group">
                    <div className="col-span-4 font-mono text-sm font-bold text-zinc-900">{key}</div>
                    <div className="col-span-6 text-sm text-zinc-500 truncate flex items-center gap-2">
                      {key === "brand_color_presets" && Array.isArray(value) ? (
                        <div className="flex gap-1">
                          {value.slice(0, 8).map((c: string) => (
                            <div key={c} className="w-4 h-4 rounded-full border border-zinc-200" style={{ backgroundColor: c }} />
                          ))}
                          {value.length > 8 && <span className="text-[10px] text-zinc-400">+{value.length - 8}</span>}
                        </div>
                      ) : (
                        typeof value === "object" ? JSON.stringify(value) : String(value)
                      )}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button
                        onClick={() => setViewingSetting({ key, value })}
                        className="p-2 text-zinc-400 hover:text-marine hover:bg-marine/5 rounded-xl transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(key)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Setting"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-xl font-bold tracking-tight">Create New Setting</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3 text-blue-800">
                <Info size={20} className="mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Settings are stored as JSON. You can enter simple strings, numbers, or complex objects/arrays.
                  The scope is currently set to <span className="font-bold uppercase">{scope}</span>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2">Setting Key</label>
                <input
                  type="text"
                  required
                  value={newSetting.key}
                  onChange={e => setNewSetting({ ...newSetting, key: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marine/5 font-mono"
                  placeholder="e.g. ui_theme_mode"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-900 mb-2">Value (JSON)</label>
                <textarea
                  rows={4}
                  required
                  value={newSetting.value}
                  onChange={e => setNewSetting({ ...newSetting, value: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marine/5 font-mono text-sm"
                  placeholder='e.g. "dark" or {"enabled": true}'
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-6 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine-light transition-all shadow-lg"
                >
                  Create Setting
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {viewingSetting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <Badge color="marine">{scope}</Badge>
                <h3 className="text-xl font-bold tracking-tight font-mono">{viewingSetting.key}</h3>
              </div>
              <button onClick={() => setViewingSetting(null)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Raw Value</label>
                <div className="bg-zinc-900 text-zinc-100 p-6 rounded-2xl font-mono text-sm overflow-x-auto max-h-96">
                  <pre>{JSON.stringify(viewingSetting.value, null, 2)}</pre>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setViewingSetting(null)}
                  className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
