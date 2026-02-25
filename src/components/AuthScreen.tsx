import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Database, Shield, Lock, Users, Mail, Key, Chrome } from "lucide-react";
import { User } from "../types";

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetch("/api/me")
          .then(res => res.json())
          .then(user => {
            if (user) onLogin(user);
          });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch("/api/auth/google/url");
      const { url } = await res.json();
      window.open(url, "google_login", "width=600,height=700");
    } catch (err) {
      setError("Failed to initialize Google login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = mode === "login" ? "/api/auth/login" : mode === "register" ? "/api/auth/register" : "/api/auth/reset-password";
    const body = mode === "login" ? { username, password } : mode === "register" ? { username, email, password } : { email, newPassword: password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (mode === "login") {
        const meRes = await fetch("/api/me");
        const meData = await meRes.json();
        onLogin(meData);
      } else if (mode === "register") {
        setMode("login");
        setError("Registration successful! Please login.");
      } else {
        setMode("login");
        setError("Password reset successful! Please login.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden"
      >
        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
            <Database size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FlexCatalog</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {mode === "login" ? "Welcome back! Please login to your account." : 
             mode === "register" ? "Create a new account to get started." : 
             "Reset your account password."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 ${error.includes("successful") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {error.includes("successful") ? <Shield size={16} /> : <Lock size={16} />}
              {error}
            </div>
          )}

          <div className="space-y-4">
            {mode !== "reset" && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="johndoe"
                  />
                </div>
              </div>
            )}

            {(mode === "register" || mode === "reset") && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
                {mode === "reset" ? "New Password" : "Password"}
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : 
             mode === "login" ? "Login" : 
             mode === "register" ? "Create Account" : 
             "Reset Password"}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400 font-bold">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold hover:bg-zinc-50 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Chrome size={20} className="text-blue-500" />
            Google
          </button>

          <div className="pt-4 text-center space-y-2">
            {mode === "login" ? (
              <>
                <p className="text-sm text-zinc-500">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setMode("register")} className="font-bold text-black hover:underline">Register</button>
                </p>
                <button type="button" onClick={() => setMode("reset")} className="text-xs text-zinc-400 hover:text-zinc-600">Forgot password?</button>
              </>
            ) : (
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-bold text-black hover:underline">Login</button>
              </p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
