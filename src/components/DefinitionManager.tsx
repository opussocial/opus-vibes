import React, { useState } from "react";
import { Download, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export const DefinitionManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/definition/export");
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `app-definition-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess("Definition exported successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        const res = await fetch("/api/definition/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Import failed");
        }
        
        setSuccess("Definition imported successfully! Please refresh the page to see changes.");
        // Optionally reload the page
        // window.location.reload();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        e.target.value = ""; // Reset input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-marine">App Definition</h2>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">Export or import the entire application structure, including schemas, roles, and relationships.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <Download size={24} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Export Structure</h3>
          <p className="text-zinc-500 text-sm mb-6 flex-1">
            Download a JSON file containing all element types, properties, roles, and relationship definitions. 
            Use this to backup your structure or move it to another environment.
          </p>
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Instructions</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              Click the button below to generate a snapshot of your current application definition. 
              This includes schemas, roles, and relationships, but **no element data**.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full py-3 bg-marine text-brand-yellow rounded-xl font-bold hover:bg-marine/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            Export JSON
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
            <Upload size={24} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Import Structure</h3>
          <p className="text-zinc-500 text-sm mb-6 flex-1">
            Upload a previously exported JSON file to update or restore the application structure. 
            <span className="text-red-500 font-medium ml-1">Warning: This will overwrite existing definitions.</span>
          </p>
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 mb-6">
            <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Instructions</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Select a valid `.json` definition file. The system will merge types and roles by their unique slugs. 
              Existing records will be updated with the new structure.
            </p>
          </div>
          
          <label className="block">
            <span className="sr-only">Choose file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={loading}
              className="block w-full text-sm text-zinc-500
                file:mr-4 file:py-3 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-bold
                file:bg-zinc-100 file:text-zinc-700
                hover:file:bg-zinc-200
                cursor-pointer disabled:opacity-50"
            />
          </label>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700"
          >
            <CheckCircle size={20} />
            <p className="text-sm font-medium">{success}</p>
          </motion.div>
        )}
      </div>

      <div className="mt-12 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
        <h4 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-widest">Important Notes</h4>
        <ul className="space-y-2 text-sm text-zinc-600 list-disc pl-5">
          <li>The export includes **definitions only** (schemas, roles, relationships). It does **not** include actual elements or user data.</li>
          <li>Importing will match records by their **slug**. If a slug exists, it will be updated. If not, it will be created.</li>
          <li>Relationships and hierarchy are reconstructed after all types and roles are processed.</li>
          <li>It is recommended to backup your database before performing a large import.</li>
        </ul>
      </div>
    </div>
  );
};
