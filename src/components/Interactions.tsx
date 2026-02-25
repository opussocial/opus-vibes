import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Star, MessageSquare, Send, Trash2, Clock } from "lucide-react";
import { Interaction, InteractionType, User } from "../types";

interface InteractionsProps {
  elementId: number;
  currentUser: User;
}

export const Interactions = ({ elementId, currentUser }: InteractionsProps) => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [types, setTypes] = useState<InteractionType[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [elementId]);

  const fetchData = async () => {
    const [intRes, typeRes] = await Promise.all([
      fetch(`/api/elements/${elementId}/interactions`),
      fetch("/api/interaction-types")
    ]);
    const [intData, typeData] = await Promise.all([intRes.json(), typeRes.json()]);
    setInteractions(intData);
    setTypes(typeData);
  };

  const handleInteract = async (typeId: number, content?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/elements/${elementId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type_id: typeId, content })
      });
      if (res.ok) {
        fetchData();
        if (content) setComment("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/interactions/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const likes = interactions.filter(i => i.type_name === "like");
  const favorites = interactions.filter(i => i.type_name === "favorite");
  const comments = interactions.filter(i => i.type_name === "comment");

  const hasLiked = likes.some(l => l.user_id === currentUser.id);
  const hasFavorited = favorites.some(f => f.user_id === currentUser.id);

  const likeType = types.find(t => t.name === "like");
  const favType = types.find(t => t.name === "favorite");
  const commentType = types.find(t => t.name === "comment");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
        <button
          onClick={() => !hasLiked && likeType && handleInteract(likeType.id)}
          disabled={loading || hasLiked}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            hasLiked 
              ? "bg-red-50 text-red-500 font-bold" 
              : "hover:bg-zinc-100 text-zinc-500"
          }`}
        >
          <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
          <span>{likes.length}</span>
        </button>

        <button
          onClick={() => !hasFavorited && favType && handleInteract(favType.id)}
          disabled={loading || hasFavorited}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            hasFavorited 
              ? "bg-amber-50 text-amber-500 font-bold" 
              : "hover:bg-zinc-100 text-zinc-500"
          }`}
        >
          <Star size={20} fill={hasFavorited ? "currentColor" : "none"} />
          <span>{favorites.length}</span>
        </button>

        <div className="flex items-center gap-2 text-zinc-500 px-4 py-2">
          <MessageSquare size={20} />
          <span>{comments.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Comments</h3>
        
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold text-xs">
            {currentUser.username[0].toUpperCase()}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[80px] text-sm"
            />
            <button
              onClick={() => comment && commentType && handleInteract(commentType.id, comment)}
              disabled={loading || !comment}
              className="absolute right-3 bottom-3 p-2 bg-black text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <AnimatePresence initial={false}>
            {comments.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-3 group"
              >
                <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 font-bold text-[10px]">
                  {c.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="bg-zinc-50 p-3 rounded-2xl rounded-tl-none relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-900">{c.username}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        {(c.user_id === currentUser.id || currentUser.permissions.includes("manage_roles")) && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
