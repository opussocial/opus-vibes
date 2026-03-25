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
  User as UserIcon,
  LogOut,
  Activity,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { Element, ElementType, ElementDetail, MODULAR_TABLES, User, Role, TypePermission, RelationshipType, GraphEdge } from "./types";

// --- Theme ---
import { ThemeEngine } from "./theme/ThemeEngine";
import { ThemeProvider } from "./theme/ThemeContext";

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
import { ElementView } from "./components/ElementView";
import { Profile } from "./components/Profile";
import { TaskMonitor } from "./components/TaskMonitor";
import { DefinitionManager } from "./components/DefinitionManager";
import { SettingsManager } from "./components/SettingsManager";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [elements, setElements] = useState<Element[]>([]);
  const [types, setTypes] = useState<ElementType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [relTypes, setRelTypes] = useState<RelationshipType[]>([]);
  const [graph, setGraph] = useState<GraphEdge[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Missing states for creation
  const [newType, setNewType] = useState<Partial<ElementType>>({ 
    name: "", 
    description: "", 
    properties: [], 
    allowed_parent_types: [], 
    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`, 
    icon: "Package" 
  });
  const [newRole, setNewRole] = useState({ name: "Untitled Role", description: "" });
  const [newEdge, setNewEdge] = useState<Partial<GraphEdge>>({});
  const [newRelType, setNewRelType] = useState<Partial<RelationshipType>>({});
  const [editingElement, setEditingElement] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<ElementType | null>(null);

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setLoading(false);
    };
    init();
  }, []);

  // Set default settings if not set
  useEffect(() => {
    if (elements.length > 0 && currentUser?.permissions.includes("manage_types")) {
      const updates: Record<string, string> = {};
      
      if (!settings["home_element"]) {
        const homeElement = elements.find(e => e.slug === "home") || elements[0];
        updates["home_element"] = homeElement.slug;
      }
      
      if (!settings["active_theme"]) {
        updates["active_theme"] = "magazine";
      }

      if (Object.keys(updates).length > 0) {
        Promise.all(
          Object.entries(updates).map(([key, value]) => 
            fetch(`/api/settings/${key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value })
            })
          )
        ).then(() => fetchData());
      }
    }
  }, [elements, settings, currentUser]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsFabOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setElements([]);
    setTypes([]);
    setRoles([]);
    setUsers([]);
    navigate("/");
  };

  const fetchData = async () => {
    try {
      const [meRes, eRes, tRes, rtRes, gRes, fRes, sRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/elements"),
        fetch("/api/types"),
        fetch("/api/relationship-types"),
        fetch("/api/graph"),
        fetch("/api/features"),
        fetch("/api/settings")
      ]);
      
      const user = await meRes.json();
      setCurrentUser(user);
      
      setFeatures(await fRes.json());
      setSettings(await sRes.json());

      if (!user) return;

      setElements(await eRes.json());
      setTypes(await tRes.json());
      setRelTypes(await rtRes.json());
      setGraph(await gRes.json());

      if (user.permissions.includes("manage_roles")) {
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

  const updateRoleGlobalPermission = async (roleIdOrSlug: string | number, permissionId: number, active: boolean) => {
    const role = roles.find(r => r.id === roleIdOrSlug || r.slug === roleIdOrSlug);
    if (!role) return;
    
    const newPermIds = active 
      ? [...role.permissions.map(p => p.id), permissionId]
      : role.permissions.map(p => p.id).filter(id => id !== permissionId);
      
    const res = await fetch(`/api/roles/${role.slug}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission_ids: newPermIds })
    });
    if (res.ok) fetchData();
  };

  const updateRoleTypePermission = async (roleIdOrSlug: string | number, typeIdOrSlug: string | number, field: string, value: boolean) => {
    const role = roles.find(r => r.id === roleIdOrSlug || r.slug === roleIdOrSlug);
    const type = types.find(t => t.id === typeIdOrSlug || t.slug === typeIdOrSlug);
    if (!role || !type) return;

    const typePerm = role.type_permissions.find(tp => tp.type_id === type.id);
    if (!typePerm) return;

    const res = await fetch(`/api/roles/${role.slug}/type-permissions/${type.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...typePerm, [field]: value })
    });
    if (res.ok) fetchData();
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRole)
    });
    if (res.ok) {
      setNewRole({ name: "Untitled Role", description: "" });
      await fetchData();
      navigate("/admin/roles");
    }
  };

  const deleteType = async (idOrSlug: string | number) => {
    if (!confirm("Are you sure? This will delete all elements of this type.")) return;
    const res = await fetch(`/api/types/${idOrSlug}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  const createRelType = async () => {
    const res = await fetch("/api/relationship-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRelType)
    });
    if (res.ok) {
      setNewRelType({});
      await fetchData();
      navigate("/admin/relationships");
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
      setNewEdge({});
      await fetchData();
      navigate("/admin/relationships");
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
    setNewType({ 
      name: "Untitled Type", 
      description: "", 
      properties: [],
      allowed_parent_types: [],
      color: "#6366f1",
      icon: "Package"
    });
    await fetchData();
    navigate("/admin/types");
  };

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("manage_types")) return alert("Permission denied");
    if (!newType.id) return;

    const res = await fetch(`/api/types/${newType.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "x-user-id": currentUser?.id.toString() || ""
      },
      body: JSON.stringify(newType)
    });
    
    if (res.ok) {
      setNewType({ 
        name: "Untitled Type", 
        description: "", 
        properties: [],
        allowed_parent_types: [],
        color: "#6366f1",
        icon: "Package"
      });
      await fetchData();
      navigate("/admin/types");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update type");
    }
  };

  const toggleProp = (table: string, label: string) => {
    const exists = newType.properties.find(p => p.table_name === table);
    if (exists) {
      setNewType({ ...newType, properties: newType.properties.filter(p => p.table_name !== table) });
    } else {
      setNewType({ ...newType, properties: [...newType.properties, { table_name: table, label }] });
    }
  };

  const handleEdit = async (idOrSlug: string | number) => {
    const res = await fetch(`/api/elements/${idOrSlug}`, {
      headers: { "x-user-id": currentUser?.id.toString() || "" }
    });
    const data = await res.json();
    setEditingElement(data);
    setIsCreating(false);
  };

  const handleDelete = async (idOrSlug: string | number) => {
    if (!confirm("Are you sure you want to delete this element?")) return;
    await fetch(`/api/elements/${idOrSlug}`, { 
      method: "DELETE",
      headers: { "x-user-id": currentUser?.id.toString() || "" }
    });
    fetchData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElement) return;

    const method = editingElement.id ? "PUT" : "POST";
    const url = editingElement.id ? `/api/elements/${editingElement.slug}` : "/api/elements";
    
    const payload = {
      name: editingElement.name,
      type_id: editingElement.type_id,
      parent_id: editingElement.parent_id,
      status: editingElement.status,
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

  const startNewElement = (type: ElementType, parentId?: number) => {
    setSelectedType(type);
    const initialData: any = {
      name: `Untitled ${type.name}`,
      type_id: type.id,
      type_name: type.name,
      parent_id: parentId,
    };
    type.properties.forEach(p => {
      let defaults = {};
      if (p.table_name === "file") defaults = { filename: "Untitled File" };
      if (p.table_name === "urls_embeds") defaults = { title: "Untitled Link" };
      if (p.table_name === "product_info") defaults = { currency: "USD", sku: "SKU-000" };
      if (p.table_name === "place") defaults = { address: "Untitled Location" };
      if (p.table_name === "color") defaults = { hex: "#6366f1" };
      initialData[p.table_name] = defaults;
    });
    setEditingElement(initialData);
    setIsCreating(true);
  };

  const isAdminPath = location.pathname.startsWith("/admin");

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-marine rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading FlexCatalog...</p>
        </div>
      </div>
    );
  }

  if (!isAdminPath) {
    return (
      <ThemeProvider value={{ elements, types, relTypes, graph, settings, currentUser }}>
        <ThemeEngine currentUser={currentUser} onLogout={handleLogout} settings={settings} />
      </ThemeProvider>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={() => {
      fetchData();
    }} />;
  }

  const isElementView = location.pathname.startsWith("/admin/elements/") && !location.pathname.endsWith("/edit") && location.pathname !== "/admin/elements/new";
  const currentElementSlug = isElementView ? location.pathname.split("/")[3] : null;
  const currentElement = elements.find(e => e.slug === currentElementSlug);
  const allowedChildTypes = currentElement ? types.filter(t => t.allowed_parent_types?.includes(currentElement.type_id)) : [];

  return (
    <div className="admin-ui flex flex-col md:flex-row h-screen bg-white text-zinc-900 overflow-hidden">
      {/* Mobile Menu Trigger (Floating) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-40 p-3 bg-white border border-zinc-200 rounded-2xl shadow-lg text-marine md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 border-r border-zinc-100 bg-zinc-50/30 p-6 flex flex-col gap-8 transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-marine rounded-xl flex items-center justify-center text-brand-yellow shadow-lg shadow-marine/20">
            <Database size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-marine">FlexCatalog</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Elements" 
            active={location.pathname === "/admin"} 
            to="/admin" 
          />
          <SidebarItem 
            icon={Settings} 
            label="Schema Types" 
            active={location.pathname.startsWith("/admin/types")} 
            to="/admin/types" 
          />
          <SidebarItem 
            icon={Shield} 
            label="Roles" 
            active={location.pathname.startsWith("/admin/roles")} 
            to="/admin/roles" 
          />
          <SidebarItem 
            icon={LinkIcon} 
            label="Relationships" 
            active={location.pathname.startsWith("/admin/relationships")} 
            to="/admin/relationships" 
          />
          <SidebarItem 
            icon={UserIcon} 
            label="My Profile" 
            active={location.pathname === "/admin/profile"} 
            to="/admin/profile" 
          />
          {hasPermission("manage_roles") && (
            <SidebarItem 
              icon={Activity} 
              label="Tasks" 
              active={location.pathname === "/admin/tasks"} 
              to="/admin/tasks" 
            />
          )}
          {hasPermission("manage_types") && (
            <SidebarItem 
              icon={Settings} 
              label="App Definition" 
              active={location.pathname === "/admin/definition"} 
              to="/admin/definition" 
            />
          )}
          {hasPermission("manage_types") && (
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={location.pathname === "/admin/settings"} 
              to="/admin/settings" 
            />
          )}
          {hasPermission("manage_types") && (
            <SidebarItem 
              icon={Shield} 
              label="Feature Switches" 
              active={location.pathname === "/admin/features"} 
              to="/admin/features" 
            />
          )}
          {hasPermission("manage_roles") && (
            <SidebarItem 
              icon={Users} 
              label="Users" 
              active={location.pathname === "/admin/users"} 
              to="/admin/users" 
            />
          )}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="p-4 bg-marine rounded-2xl text-white shadow-xl shadow-marine/10">
            <div className="flex items-center justify-between mb-4">
              <Link 
                to="/admin/profile"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
              >
                <div className="w-8 h-8 bg-marine-light rounded-full flex items-center justify-center text-brand-yellow">
                  <UserIcon size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-yellow/60 uppercase tracking-widest">User</p>
                  <p className="text-sm font-bold truncate w-24">{currentUser?.username}</p>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-marine-light rounded-lg text-white/60 hover:text-brand-yellow transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
            <div className="px-2 py-1 bg-marine-dark/50 rounded-lg text-[10px] font-bold text-brand-yellow uppercase tracking-widest text-center">
              {currentUser?.role_name}
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/admin" element={
              <Dashboard 
                elements={elements}
                types={types}
                getTypePermission={getTypePermission}
                handleDelete={handleDelete}
                currentUser={currentUser}
              />
            } />
            <Route path="/admin/elements/new" element={
              <ElementEditor 
                types={types}
                elements={elements}
                handleSave={handleSave}
                getTypePermission={getTypePermission}
                fetchData={fetchData}
              />
            } />
            <Route path="/admin/elements/:slug" element={
              <ElementView 
                currentUser={currentUser} 
                types={types}
                relTypes={relTypes}
              />
            } />
            <Route path="/admin/elements/:slug/edit" element={
              <ElementEditor 
                types={types}
                elements={elements}
                handleSave={handleSave}
                getTypePermission={getTypePermission}
                fetchData={fetchData}
              />
            } />
            <Route path="/admin/types/*" element={
              <SchemaTypes 
                types={types}
                hasPermission={hasPermission}
                deleteType={deleteType}
                newType={newType}
                setNewType={setNewType}
                handleCreateType={handleCreateType}
                handleUpdateType={handleUpdateType}
                toggleProp={toggleProp}
                MODULAR_TABLES={MODULAR_TABLES}
              />
            } />
            <Route path="/admin/roles/*" element={
              <Roles 
                roles={roles}
                allPermissions={allPermissions}
                hasPermission={hasPermission}
                updateRoleGlobalPermission={updateRoleGlobalPermission}
                updateRoleTypePermission={updateRoleTypePermission}
                newRole={newRole}
                setNewRole={setNewRole}
                handleCreateRole={handleCreateRole}
                types={types}
              />
            } />
            <Route path="/admin/relationships/*" element={
              <Relationships 
                relTypes={relTypes}
                graph={graph}
                elements={elements}
                types={types}
                hasPermission={hasPermission}
                deleteRelType={deleteRelType}
                deleteEdge={deleteEdge}
                newRelType={newRelType}
                setNewRelType={setNewRelType}
                createRelType={createRelType}
                newEdge={newEdge}
                setNewEdge={setNewEdge}
                createEdge={createEdge}
              />
            } />
            <Route path="/admin/users" element={
              <UsersScreen 
                users={users}
                roles={roles}
                currentUser={currentUser}
                updateUserRole={updateUserRole}
              />
            } />
            <Route path="/admin/profile" element={
              <Profile user={currentUser} />
            } />
            <Route path="/admin/tasks" element={<TaskMonitor />} />
            <Route path="/admin/definition" element={<DefinitionManager />} />
            <Route path="/admin/settings" element={
              <SettingsManager 
                types={types} 
                currentUser={currentUser} 
                hasPermission={hasPermission} 
              />
            } />
            <Route path="/admin/features" element={
              <SettingsManager 
                types={types} 
                currentUser={currentUser} 
                hasPermission={hasPermission} 
                initialScope="features"
              />
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {/* FAB Button */}
      {((["/admin", "/admin/types", "/admin/relationships", "/admin/roles"].some(path => location.pathname === path)) || (isElementView && allowedChildTypes.length > 0)) && (
        <div className="fixed bottom-8 right-8 z-40">
          <AnimatePresence>
            {location.pathname === "/admin" && isFabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-16 right-0 bg-white border border-zinc-200 rounded-2xl shadow-2xl py-3 w-56 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-zinc-100 mb-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select Type</p>
                </div>
                {types.map(t => {
                  const perm = getTypePermission(t.id);
                  if (!perm.can_create) return null;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        navigate(`/admin/elements/new?type=${t.slug}`);
                        setIsFabOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-zinc-200" />
                      {t.name}
                    </button>
                  );
                })}
              </motion.div>
            )}

            {isElementView && isFabOpen && allowedChildTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-16 right-0 bg-white border border-zinc-200 rounded-2xl shadow-2xl py-3 w-56 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-zinc-100 mb-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Add Child Element</p>
                </div>
                {allowedChildTypes.map(t => {
                  const perm = getTypePermission(t.id);
                  if (!perm.can_create) return null;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        navigate(`/admin/elements/new?type=${t.slug}&parent=${currentElement?.id}`);
                        setIsFabOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-zinc-200" />
                      {t.name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              if (location.pathname === "/admin" || isElementView) {
                setIsFabOpen(!isFabOpen);
              } else if (location.pathname === "/admin/types") {
                navigate("/admin/types/new");
              } else if (location.pathname === "/admin/relationships") {
                navigate("/admin/relationships/type/new");
              } else if (location.pathname === "/admin/roles") {
                navigate("/admin/roles/new");
              }
            }}
            className="w-14 h-14 bg-brand-yellow text-marine rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-4 border-white"
          >
            <Plus size={24} className={`transition-transform duration-300 ${isFabOpen ? 'rotate-45' : ''}`} />
            
            <div className="absolute right-full mr-4 px-3 py-1.5 bg-marine text-white text-[10px] font-bold uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-widest shadow-lg">
              {location.pathname === "/admin" ? "Add Element" : isElementView ? "Add Child" : location.pathname === "/admin/types" ? "Add Schema Type" : location.pathname === "/admin/relationships" ? "Add Relationship" : location.pathname === "/admin/roles" ? "Add Role" : "Quick Add"}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

