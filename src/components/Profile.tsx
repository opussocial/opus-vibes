import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, Mail, User as UserIcon, MapPin, FileText, Save, Loader2, ExternalLink } from "lucide-react";
import { User, ElementDetail } from "../types";
import { Badge } from "./common/Badge";
import { Link } from "react-router-dom";

interface ProfileProps {
  user: User;
}

export const Profile = ({ user }: ProfileProps) => {
  const [profile, setProfile] = useState<ElementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    if (user.profile_element_id) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user.profile_element_id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/elements/${user.profile_element_id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile element:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/elements/${profile.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          type_id: profile.type_id,
          modular_data: {
            content: profile.content || {},
            place: profile.place || {},
            file: profile.file || {}
          }
        })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        fetchProfile();
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Profile</h2>
          <p className="text-zinc-500 mt-1">Manage your account information and personal details.</p>
        </div>
        <Badge color={user.role_name === "Super Admin" ? "purple" : user.role_name === "Editor" ? "blue" : "zinc"}>
          {user.role_name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-zinc-100 to-zinc-200" />
            <div className="px-6 pb-6">
              <div className="relative -mt-10 mb-4">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-zinc-400 overflow-hidden">
                  {profile?.file?.url ? (
                    <img src={profile.file.url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={40} />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-900">{user.username}</h3>
              <p className="text-sm text-zinc-500 mb-6">{user.email}</p>
              
              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-zinc-400" />
                  <span className="text-sm font-medium">{user.role_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-zinc-400" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {user.permissions.length > 0 ? (
                user.permissions.map(p => (
                  <span key={p} className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {p.replace("_", " ")}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-400 italic">No special permissions.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Personal Info (Profile Element) */}
        <div className="lg:col-span-2">
          {profile ? (
            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Personal Information</h3>
                  <p className="text-sm text-zinc-500">This information is stored as a Profile element.</p>
                </div>
                <Link 
                  to={`/elements/${profile.slug}`}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-black transition-colors"
                >
                  View as Element <ExternalLink size={14} />
                </Link>
              </div>
              
              <div className="p-8 space-y-6">
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <UserIcon size={14} /> Full Name
                    </label>
                    <input 
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                      <MapPin size={14} /> Location
                    </label>
                    <input 
                      type="text"
                      value={profile.place?.address || ""}
                      onChange={e => setProfile({ ...profile, place: { ...profile.place, address: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    <FileText size={14} /> Bio
                  </label>
                  <textarea 
                    rows={4}
                    value={profile.content?.body || ""}
                    onChange={e => setProfile({ ...profile, content: { ...profile.content, body: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                    <UserIcon size={14} /> Avatar URL
                  </label>
                  <input 
                    type="text"
                    value={profile.file?.url || ""}
                    onChange={e => setProfile({ ...profile, file: { ...profile.file, url: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="pt-6 border-t border-zinc-100 flex justify-end">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center">
              <p className="text-zinc-500">No profile element found. Please try logging in again.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
