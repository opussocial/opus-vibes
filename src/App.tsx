import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Database,
  Link as LinkIcon,
  Trash2,
  X,
  Shield,
  Users,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Element, ElementType, ElementDetail, MODULAR_TABLES, User, Role, TypePermission, RelationshipType, GraphEdge } from "./types";

// --- Components ---
import { AuthScreen } from "./components/AuthScreen";
import { SidebarItem } from "./components/common/SidebarItem";
import { Badge } from "./components/common/Badge";
import { Dashboard } from "./components/Dashboard";
import { SchemaTypes } from "./components/SchemaTypes";
import { Roles } from "./components/Roles";
import { Users as UsersScreen } from "./components/Users";
import { Relationships } from "./components/Relationships";
import { ElementEditor } from "./components/ElementEditor";

export default function App() {
  const [view, setView] = useState<"dashboard" | "types" | "roles" | "users" | "relationships">("dashboard");
  const [elements, setElements] = useState<Element[]>([]);
  const [types, setTypes] = useState<ElementType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [relTypes, setRelTypes] = useState<RelationshipType[]>([]);
  const [graph, setGraph] = useState<GraphEdge[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingElement, setEditingElement] = useState<ElementDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<ElementType | null>(null);
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newType, setNewType] = useState({ name: "", description: "", properties: [] as any[] });
  const [isCreatingRelType, setIsCreatingRelType] = useState(false);
  const [newRelType, setNewRelType] = useState({ source_type_id: 0, target_type_id: 0, name: "" });
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [newEdge, setNewEdge] = useState({ rel_type_id: 0, source_el_id: 0, target_el_id: 0 });

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/me");
      const user = await res.json();
      if (user) {
        setCurrentUser(user);
        fetchData(user.id);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setElements([]);
    setTypes([]);
    setRoles([]);
    setUsers([]);
  };

  const fetchData = async (userId?: number) => {
    const uid = userId || currentUser?.id;
    if (!uid) return;

    setLoading(true);
    try {
      const [eRes, tRes, rtRes, gRes] = await Promise.all([
        fetch("/api/elements"),
        fetch("/api/types"),
        fetch("/api/relationship-types"),
        fetch("/api/graph")
      ]);
      setElements(await eRes.json());
      setTypes(await tRes.json());
      setRelTypes(await rtRes.json());
      setGraph(await gRes.json());

      if (currentUser?.permissions.includes("manage_roles")) {
        const [rRes, uRes, pRes] = await Promise.all([
          fetch("/api/roles"),
          fetch("/api/users"),
          fetch("/api/permissions")
        ]);
        setRoles(await rRes.json());
        setUsers(await uRes.json());
        setAllPermissions(await pRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, roleId: number) => {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_id: roleId })
    });
    if (res.ok) fetchData();
  };

  const updateRoleGlobalPermission = async (roleId: number, permissionId: number, active: boolean) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    const newPermIds = active 
      ? [...role.permissions.map(p => p.id), permissionId]
      : role.permissions.map(p => p.id).filter(id => id !== permissionId);
      
    const res = await fetch(`/api/roles/${roleId}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission_ids: newPermIds })
    });
    if (res.ok) fetchData();
  };

  const updateRoleTypePermission = async (roleId: number, typeId: number, field: string, value: boolean) => {
    const role = roles.find(r => r.id === roleId);
    const typePerm = role?.type_permissions.find(tp => tp.type_id === typeId);
    if (!typePerm) return;

    const res = await fetch(`/api/roles/${roleId}/type-permissions/${typeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...typePerm, [field]: value })
    });
    if (res.ok) fetchData();
  };

  const deleteType = async (id: number) => {
    if (!confirm("Are you sure? This will delete all elements of this type.")) return;
    const res = await fetch(`/api/types/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const createRelType = async () => {
    const res = await fetch("/api/relationship-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRelType)
    });
    if (res.ok) {
      setIsCreatingRelType(false);
      fetchData();
    }
  };

  const deleteRelType = async (id: number) => {
    const res = await fetch(`/api/relationship-types/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const createEdge = async () => {
    const res = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEdge)
    });
    if (res.ok) {
      setIsCreatingEdge(false);
      fetchData();
    }
  };

  const deleteEdge = async (id: number) => {
    const res = await fetch(`/api/graph/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const hasPermission = (perm: string) => currentUser?.permissions.includes(perm);
  
  const getTypePermission = (typeId: number) => {
    return currentUser?.type_permissions.find(tp => tp.type_id === typeId) || {
      can_view: 0, can_create: 0, can_edit: 0, can_delete: 0
    };
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("manage_types")) return alert("Permission denied");
    
    await fetch("/api/types", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-user-id": currentUser?.id.toString() || ""
      },
      body: JSON.stringify(newType)
    });
    setIsCreatingType(false);
    setNewType({ name: "", description: "", properties: [] });
    fetchData();
  };

  const toggleProp = (table: string, label: string) => {
    const exists = newType.properties.find(p => p.table_name === table);
    if (exists) {
      setNewType({ ...newType, properties: newType.properties.filter(p => p.table_name !== table) });
    } else {
      setNewType({ ...newType, properties: [...newType.properties, { table_name: table, label }] });
    }
  };

  const handleEdit = async (id: number) => {
    const res = await fetch(`/api/elements/${id}`, {
      headers: { "x-user-id": currentUser?.id.toString() || "" }
    });
    const data = await res.json();
    setEditingElement(data);
    setIsCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this element?")) return;
    await fetch(`/api/elements/${id}`, { 
      method: "DELETE",
      headers: { "x-user-id": currentUser?.id.toString() || "" }
    });
    fetchData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElement) return;

    const method = editingElement.id ? "PUT" : "POST";
    const url = editingElement.id ? `/api/elements/${editingElement.id}` : "/api/elements";
    
    const payload = {
      name: editingElement.name,
      type_id: editingElement.type_id,
      parent_id: editingElement.parent_id,
      modular_data: {} as any
    };

    const type = types.find(t => t.id === editingElement.type_id);
    if (type) {
      type.properties.forEach(prop => {
        payload.modular_data[prop.table_name] = editingElement[prop.table_name] || {};
      });
    }

    await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "x-user-id": currentUser?.id.toString() || ""
      },
      body: JSON.stringify(payload)
    });

    setEditingElement(null);
    setIsCreating(false);
    fetchData();
  };

  const startNewElement = (type: ElementType) => {
    setSelectedType(type);
    const initialData: any = {
      name: "",
      type_id: type.id,
      type_name: type.name,
    };
    type.properties.forEach(p => initialData[p.table_name] = {});
    setEditingElement(initialData);
    setIsCreating(true);
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading FlexCatalog...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={(user) => {
      setCurrentUser(user);
      fetchData(user.id);
    }} />;
  }

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <Database size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FlexCatalog</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Elements" 
            active={view === "dashboard"} 
            onClick={() => setView("dashboard")} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Schema Types" 
            active={view === "types"} 
            onClick={() => setView("types")} 
          />
          <SidebarItem 
            icon={Shield} 
            label="Roles" 
            active={view === "roles"} 
            onClick={() => setView("roles")} 
          />
          <SidebarItem 
            icon={LinkIcon} 
            label="Relationships" 
            active={view === "relationships"} 
            onClick={() => setView("relationships")} 
          />
          {hasPermission("manage_roles") && (
            <SidebarItem 
              icon={Users} 
              label="Users" 
              active={view === "users"} 
              onClick={() => setView("users")} 
            />
          )}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-4 bg-zinc-900 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-50 uppercase">User</p>
                  <p className="text-sm font-bold truncate w-24">{currentUser?.username}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
            <div className="px-2 py-1 bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">
              {currentUser?.role_name}
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Quick Action</p>
            <div className="flex flex-col gap-2">
              {types.map(t => {
                const perm = getTypePermission(t.id);
                if (!perm.can_create) return null;
                return (
                  <button 
                    key={t.id}
                    onClick={() => startNewElement(t)}
                    className="text-left text-sm font-medium text-zinc-600 hover:text-black flex items-center justify-between group"
                  >
                    New {t.name}
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <AnimatePresence mode="wait">
          {view === "dashboard" ? (
            <Dashboard 
              elements={elements}
              getTypePermission={getTypePermission}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ) : view === "types" ? (
            <SchemaTypes 
              types={types}
              hasPermission={hasPermission}
              setIsCreatingType={setIsCreatingType}
              deleteType={deleteType}
              isCreatingType={isCreatingType}
              newType={newType}
              setNewType={setNewType}
              handleCreateType={handleCreateType}
              toggleProp={toggleProp}
              MODULAR_TABLES={MODULAR_TABLES}
            />
          ) : view === "roles" ? (
            <Roles 
              roles={roles}
              allPermissions={allPermissions}
              hasPermission={hasPermission}
              updateRoleGlobalPermission={updateRoleGlobalPermission}
              updateRoleTypePermission={updateRoleTypePermission}
            />
          ) : view === "relationships" ? (
            <Relationships 
              relTypes={relTypes}
              graph={graph}
              elements={elements}
              types={types}
              hasPermission={hasPermission}
              setIsCreatingRelType={setIsCreatingRelType}
              deleteRelType={deleteRelType}
              setIsCreatingEdge={setIsCreatingEdge}
              deleteEdge={deleteEdge}
              isCreatingRelType={isCreatingRelType}
              newRelType={newRelType}
              setNewRelType={setNewRelType}
              createRelType={createRelType}
              isCreatingEdge={isCreatingEdge}
              newEdge={newEdge}
              setNewEdge={setNewEdge}
              createEdge={createEdge}
            />
          ) : view === "users" ? (
            <UsersScreen 
              users={users}
              roles={roles}
              updateUserRole={updateUserRole}
            />
          ) : (
            <div />
          )}
        </AnimatePresence>
      </main>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingElement && (
          <ElementEditor 
            editingElement={editingElement}
            setEditingElement={setEditingElement}
            isCreating={isCreating}
            types={types}
            elements={elements}
            handleSave={handleSave}
            getTypePermission={getTypePermission}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

