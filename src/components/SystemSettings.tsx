import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings, Save, Loader2, AlertCircle, Check, RefreshCcw, ToggleLeft, ToggleRight } from "lucide-react";
import { SystemConfig } from "../types";

export const SystemSettings = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: any) => {
    setSaving(key);
    try {
      const res = await fetch(`/api/config/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value })
      });
      if (res.ok) {
        setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
        setMessage({ type: "success", text: `Setting "${key}" updated.` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to update setting." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-marine" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-marine">System Configuration</h2>
          <p className="text-zinc-500 mt-1 text-lg">Manage global feature switches and system-wide settings.</p>
        </div>
        <button 
          onClick={fetchConfigs}
          className="p-3 hover:bg-zinc-100 rounded-2xl transition-colors text-zinc-400 hover:text-marine"
          title="Refresh settings"
        >
          <RefreshCcw size={24} />
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-6 rounded-3xl border flex items-center gap-4 ${message.type === "success" ? "bg-green-50 border-green-100 text-green-800" : "bg-red-50 border-red-100 text-red-800"}`}
        >
          {message.type === "success" ? <Check size={24} /> : <AlertCircle size={24} />}
          <p className="font-bold">{message.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {configs.map((config) => (
          <div key={config.key} className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-marine uppercase tracking-tight">{config.key.replace(/_/g, " ")}</h3>
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded text-[10px] font-mono font-bold uppercase">{config.key}</span>
              </div>
              <p className="text-zinc-500">{config.description}</p>
            </div>

            <div className="flex items-center gap-4">
              {typeof config.value === "boolean" ? (
                <button
                  disabled={saving === config.key || config.key === "dev_mode"}
                  onClick={() => handleUpdate(config.key, !config.value)}
                  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none ${config.value ? "bg-marine" : "bg-zinc-200"} ${config.key === "dev_mode" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${config.value ? "translate-x-11" : "translate-x-1"}`}
                  />
                  {saving === config.key && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-full">
                      <Loader2 size={16} className="animate-spin text-white" />
                    </div>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <input 
                    type="text"
                    defaultValue={config.value}
                    onBlur={(e) => {
                      if (e.target.value !== config.value) {
                        handleUpdate(config.key, e.target.value);
                      }
                    }}
                    className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marine/10 transition-all font-mono text-sm"
                  />
                  {saving === config.key && <Loader2 size={18} className="animate-spin text-marine" />}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-marine/5 border border-marine/10 rounded-[2.5rem] flex items-start gap-6">
        <div className="p-4 bg-marine text-brand-yellow rounded-2xl shadow-lg">
          <Settings size={32} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-marine">Developer Mode</h4>
          <p className="text-zinc-600 leading-relaxed">
            Developer mode is currently <span className="font-bold text-marine">always active</span>. 
            This ensures that debug information and advanced schema tools are available during development.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
