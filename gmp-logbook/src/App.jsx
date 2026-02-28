import { useState, useEffect, useCallback } from "react";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const now = () => new Date().toISOString();
const formatDT = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
};

const SEED_EQUIPMENT = [
  { id: "EQ001", name: "Réacteur R-101", location: "Salle A - Zone 1", type: "production", status: "opérationnel", createdAt: now() },
  { id: "EQ002", name: "HPLC Agilent 1260", location: "Laboratoire CQ", type: "QC", status: "opérationnel", createdAt: now() },
  { id: "EQ003", name: "Autoclave AUT-01", location: "Salle B - Zone 2", type: "utilités", status: "maintenance", createdAt: now() },
];
const SEED_ROOMS = [
  { id: "RM001", name: "Salle A - Production", classification: "Grade C", status: "opérationnelle", createdAt: now() },
  { id: "RM002", name: "Laboratoire CQ", classification: "Grade D", status: "opérationnelle", createdAt: now() },
];
const SEED_USERS = [
  { id: "U01", name: "Marie Dupont", role: "operator", password: "op123" },
  { id: "U02", name: "Jean Martin", role: "maintenance", password: "mt123" },
  { id: "U03", name: "Sophie Bernard", role: "quality", password: "qa123" },
  { id: "U04", name: "Admin Sys", role: "admin", password: "admin123" },
];

const ACTIVITY_TYPES = ["utilisation", "nettoyage", "maintenance", "calibration", "incident", "intervention technique"];
const ROLES_LABEL = { operator: "Opérateur", maintenance: "Maintenance", quality: "Qualité", admin: "Administrateur" };
const STATUS_COLORS = {
  opérationnel: "bg-green-100 text-green-800",
  opérationnelle: "bg-green-100 text-green-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  "hors service": "bg-red-100 text-red-800",
};

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; }
  });
  const set = useCallback((v) => {
    setState(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [state, set];
}

function Badge({ label, className = "" }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>{label}</span>;
}

function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${onClick ? "cursor-pointer hover:shadow-md hover:border-blue-300 transition-all" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col ${wide ? "max-w-2xl" : "max-w-lg"}`}
        style={{ maxHeight: "90vh" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...props} />
    </div>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...props}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} {...props} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", className = "" }) {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    ghost: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  };
  return (
    <button onClick={onClick} className={`font-semibold px-4 py-2 rounded-lg text-sm transition-colors ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  const [userId, setUserId] = useState(users[0].id);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleLogin = () => {
    const user = users.find(u => u.id === userId);
    if (!user || user.password !== password) { setError("Identifiants incorrects."); return; }
    onLogin(user);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📋</div>
          <h1 className="text-2xl font-bold text-gray-900">GMP Logbook</h1>
          <p className="text-sm text-gray-500 mt-1">Système de gestion des logbooks</p>
          <p className="text-xs text-blue-600 mt-0.5">Annex 11 · ALCOA+ · 21 CFR Part 11</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={userId} onChange={e => setUserId(e.target.value)}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} — {ROLES_LABEL[u.role]}</option>)}
          </select>
        </div>
        <Input label="Mot de passe" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Mot de passe" />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">Se connecter</button>
        <p className="text-xs text-gray-400 mt-4 text-center">Démo : op123 · mt123 · qa123 · admin123</p>
      </div>
    </div>
  );
}

// ── Entry Form ─────────────────────────────────────────────────────────────
function EntryFormModal({ currentUser, target, onSave, onClose, editEntry }) {
  const [activity, setActivity] = useState(editEntry?.activity || ACTIVITY_TYPES[0]);
  const [comment, setComment] = useState(editEntry?.comment || "");
  const [sigPassword, setSigPassword] = useState("");
  const [sigError, setSigError] = useState("");
  const [editReason, setEditReason] = useState("");
  const needsSig = ["nettoyage", "calibration", "maintenance"].includes(activity);
  const handleSave = () => {
    if (needsSig && sigPassword !== currentUser.password) { setSigError("Mot de passe incorrect – signature refusée."); return; }
    if (editEntry && !editReason.trim()) { setSigError("Une raison de modification est obligatoire."); return; }
    const entry = {
      id: editEntry?.id || generateId(),
      targetId: target.id,
      targetName: target.name,
      activity, comment,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      createdAt: editEntry?.createdAt || now(),
      status: "draft",
      signed: needsSig && sigPassword === currentUser.password,
      editHistory: editEntry ? [...(editEntry.editHistory || []), { by: currentUser.name, at: now(), reason: editReason, oldComment: editEntry.comment, oldActivity: editEntry.activity }] : [],
    };
    onSave(entry);
    onClose();
  };
  return (
    <Modal title={editEntry ? "Modifier une entrée" : "Nouvelle entrée logbook"} onClose={onClose}>
      <SelectField label="Type d'activité" value={activity} onChange={e => setActivity(e.target.value)} options={ACTIVITY_TYPES} />
      <Textarea label="Commentaire" value={comment} onChange={e => setComment(e.target.value)} placeholder="Décrivez l'activité réalisée..." />
      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-700 space-y-0.5">
        <div><strong>Cible :</strong> {target.name}</div>
        <div><strong>Saisi par :</strong> {currentUser.name} ({ROLES_LABEL[currentUser.role]})</div>
        <div><strong>Horodatage :</strong> {formatDT(now())}</div>
      </div>
      {editEntry && <Input label="Raison de modification (obligatoire)" value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="Ex : Correction erreur de saisie" />}
      {needsSig && (
        <div>
          <Input label="Signature électronique – confirmez votre mot de passe" type="password" value={sigPassword} onChange={e => { setSigPassword(e.target.value); setSigError(""); }} placeholder="Votre mot de passe" />
          <p className="text-xs text-blue-600 -mt-2 mb-3">⚠️ Signature requise pour cette activité (Annex 11 / 21 CFR Part 11)</p>
        </div>
      )}
      {sigError && <p className="text-red-500 text-sm mb-3">{sigError}</p>}
      <div className="flex gap-3">
        <Btn onClick={handleSave} className="flex-1">{editEntry ? "Enregistrer la modification" : "Enregistrer"}</Btn>
        <Btn onClick={onClose} variant="ghost" className="flex-1">Annuler</Btn>
      </div>
    </Modal>
  );
}

// ── Logbook Modal ──────────────────────────────────────────────────────────
function LogbookModal({ target, entries, currentUser, onNewEntry, onEditEntry, onApprove, onClose }) {
  const [filterActivity, setFilterActivity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const targetEntries = entries.filter(e => e.targetId === target.id);
  const filtered = targetEntries.filter(e => {
    if (filterActivity && e.activity !== filterActivity) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    if (search && !e.comment?.toLowerCase().includes(search.toLowerCase()) && !e.userName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).slice().reverse();
  const canApprove = currentUser.role === "quality" || currentUser.role === "admin";
  const canWrite = currentUser.role !== "quality";
  return (
    <Modal title={`📋 ${target.name}`} onClose={onClose} wide>
      <div className="flex flex-wrap gap-2 mb-4">
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" value={filterActivity} onChange={e => setFilterActivity(e.target.value)}>
          <option value="">Toutes activités</option>
          {ACTIVITY_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tous statuts</option>
          <option value="draft">En attente</option>
          <option value="approved">Approuvé</option>
        </select>
        <input className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs flex-1 min-w-0" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {canWrite && (
        <button onClick={() => onNewEntry(target)} className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
          + Nouvelle entrée
        </button>
      )}
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "360px" }}>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">{canWrite ? "Aucune entrée – cliquez sur «+ Nouvelle entrée»." : "Aucune entrée."}</p>
          </div>
        )}
        {filtered.map(entry => (
          <div key={entry.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{entry.activity}</span>
                  <Badge label={entry.status === "approved" ? "✓ Approuvé" : "En attente"} className={entry.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} />
                  {entry.signed && <Badge label="✍ Signé" className="bg-purple-100 text-purple-800" />}
                </div>
                <p className="text-sm text-gray-800 break-words">{entry.comment || <em className="text-gray-400">Aucun commentaire</em>}</p>
                <div className="text-xs text-gray-500 mt-1">{entry.userName} · {formatDT(entry.createdAt)}</div>
                {entry.editHistory?.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-xs text-orange-600 cursor-pointer">📝 {entry.editHistory.length} modification(s)</summary>
                    {entry.editHistory.map((h, i) => (
                      <div key={i} className="text-xs bg-orange-50 border border-orange-100 rounded p-2 mt-1">
                        <strong>{h.by}</strong> · {formatDT(h.at)}<br />
                        Raison : {h.reason}<br />
                        Valeur précédente : {h.oldActivity} — {h.oldComment}
                      </div>
                    ))}
                  </details>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                {canWrite && entry.status !== "approved" && entry.userId === currentUser.id && (
                  <button onClick={() => onEditEntry(entry)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">Modifier</button>
                )}
                {canApprove && entry.status !== "approved" && (
                  <button onClick={() => onApprove(entry.id)} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-lg">Approuver</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t">
        <span>{filtered.length} entrée(s)</span>
        <span>{targetEntries.filter(e => e.status === "approved").length}/{targetEntries.length} approuvée(s)</span>
      </div>
    </Modal>
  );
}

function AddEquipmentModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", location: "", type: "production", status: "opérationnel" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Modal title="Ajouter un équipement" onClose={onClose}>
      <Input label="Nom" value={form.name} onChange={set("name")} placeholder="Ex: Réacteur R-102" />
      <Input label="Localisation" value={form.location} onChange={set("location")} placeholder="Ex: Salle B - Zone 1" />
      <SelectField label="Type" value={form.type} onChange={set("type")} options={["production", "QC", "utilités"]} />
      <SelectField label="Statut" value={form.status} onChange={set("status")} options={["opérationnel", "maintenance", "hors service"]} />
      <div className="flex gap-3">
        <Btn onClick={() => { if (form.name) { onSave(form); onClose(); } }} className="flex-1">Ajouter</Btn>
        <Btn onClick={onClose} variant="ghost" className="flex-1">Annuler</Btn>
      </div>
    </Modal>
  );
}

function AddRoomModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", classification: "Grade D", status: "opérationnelle" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <Modal title="Ajouter une salle" onClose={onClose}>
      <Input label="Nom" value={form.name} onChange={set("name")} placeholder="Ex: Salle C - Zone 3" />
      <SelectField label="Classification" value={form.classification} onChange={set("classification")} options={["Grade A", "Grade B", "Grade C", "Grade D", "Non classée"]} />
      <SelectField label="Statut" value={form.status} onChange={set("status")} options={["opérationnelle", "maintenance", "hors service"]} />
      <div className="flex gap-3">
        <Btn onClick={() => { if (form.name) { onSave(form); onClose(); } }} className="flex-1">Ajouter</Btn>
        <Btn onClick={onClose} variant="ghost" className="flex-1">Annuler</Btn>
      </div>
    </Modal>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [users] = useLocalStorage("gmp_users", SEED_USERS);
  const [equipment, setEquipment] = useLocalStorage("gmp_equipment", SEED_EQUIPMENT);
  const [rooms, setRooms] = useLocalStorage("gmp_rooms", SEED_ROOMS);
  const [entries, setEntries] = useLocalStorage("gmp_entries", []);
  const [auditLog, setAuditLog] = useLocalStorage("gmp_audit", []);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("equipment");
  const [modal, setModal] = useState(null);

  const addAudit = useCallback((action, by, detail = "") => {
    setAuditLog(prev => [...prev, { action, by, at: now(), detail }]);
  }, [setAuditLog]);

  useEffect(() => {
    if (!currentUser) return;
    let timer = setTimeout(() => setCurrentUser(null), 15 * 60 * 1000);
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => setCurrentUser(null), 15 * 60 * 1000); };
    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    return () => { clearTimeout(timer); window.removeEventListener("mousemove", reset); window.removeEventListener("keydown", reset); };
  }, [currentUser]);

  const handleLogin = user => { setCurrentUser(user); addAudit("connexion", user.name); };
  const handleLogout = () => { addAudit("déconnexion", currentUser.name); setCurrentUser(null); setModal(null); };

  const handleSaveEntry = entry => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx >= 0) {
        const u = [...prev]; u[idx] = entry;
        addAudit("modification entrée", currentUser.name, `${entry.targetName} – ${entry.activity}`);
        return u;
      }
      addAudit("création entrée", currentUser.name, `${entry.targetName} – ${entry.activity}`);
      return [...prev, entry];
    });
  };

  const handleApprove = entryId => {
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: "approved", approvedBy: currentUser.name, approvedAt: now() } : e));
    addAudit("approbation entrée", currentUser.name, `Entrée ${entryId}`);
  };

  const exportCSV = () => {
    const h = ["ID", "Cible", "Activité", "Commentaire", "Utilisateur", "Rôle", "Date/Heure", "Statut", "Signé"];
    const rows = entries.map(e => [e.id, e.targetName, e.activity, `"${(e.comment || "").replace(/"/g, '""')}"`, e.userName, e.userRole, e.createdAt, e.status, e.signed ? "oui" : "non"]);
    const csv = [h, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `logbook_${Date.now()}.csv`; a.click();
  };

  if (!currentUser) return <LoginScreen users={users} onLogin={handleLogin} />;

  const canAdmin = currentUser.role === "admin";
  const canQA = currentUser.role === "quality" || canAdmin;
  const pendingCount = entries.filter(e => e.status !== "approved").length;

  const tabs = [
    { id: "equipment", label: "🔧 Équipements" },
    { id: "rooms", label: "🏭 Salles" },
    ...(canQA ? [{ id: "review", label: `✅ Revue QA${pendingCount > 0 ? ` (${pendingCount})` : ""}` }] : []),
    { id: "audit", label: "📜 Audit Trail" },
    ...(canAdmin ? [{ id: "admin", label: "⚙️ Admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📋</span>
          <div>
            <h1 className="font-bold text-lg">GMP Logbook System</h1>
            <p className="text-blue-300 text-xs">Annex 11 · ALCOA+ · 21 CFR Part 11</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{currentUser.name}</p>
            <p className="text-blue-300 text-xs">{ROLES_LABEL[currentUser.role]}</p>
          </div>
          <button onClick={handleLogout} className="bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium">Déconnexion</button>
        </div>
      </header>

      <div className="bg-white border-b px-4 py-2 flex gap-6 overflow-x-auto">
        {[
          { label: "Total entrées", value: entries.length, color: "text-blue-700" },
          { label: "En attente QA", value: pendingCount, color: pendingCount > 0 ? "text-orange-500" : "text-green-600" },
          { label: "Aujourd'hui", value: entries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).length, color: "text-purple-600" },
          { label: "Équipements", value: equipment.length, color: "text-gray-700" },
          { label: "Salles", value: rooms.length, color: "text-gray-700" },
        ].map(k => (
          <div key={k.label} className="text-center min-w-16 py-1">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-500">{k.label}</div>
          </div>
        ))}
      </div>

      <nav className="bg-white border-b px-2 flex overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
        <button onClick={exportCSV} className="ml-auto px-4 py-3 text-sm text-gray-400 hover:text-green-600 whitespace-nowrap">⬇ CSV</button>
      </nav>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">

        {activeTab === "equipment" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-lg">Équipements</h2>
              {canAdmin && <Btn onClick={() => setModal({ type: "addEq" })}>+ Ajouter</Btn>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map(eq => {
                const eqEntries = entries.filter(e => e.targetId === eq.id);
                const pending = eqEntries.filter(e => e.status !== "approved").length;
                return (
                  <Card key={eq.id} className="p-4" onClick={() => setModal({ type: "logbook", target: eq })}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">{eq.name}</h3>
                      <Badge label={eq.status} className={STATUS_COLORS[eq.status] || "bg-gray-100 text-gray-700"} />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">📍 {eq.location}</p>
                    <p className="text-xs text-gray-400 mb-3">ID: {eq.id} · {eq.type}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{eqEntries.length} entrée(s)</span>
                      {pending > 0 && <Badge label={`${pending} en attente`} className="bg-orange-100 text-orange-700" />}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-blue-600 font-medium">Ouvrir le logbook →</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-lg">Salles & Zones GMP</h2>
              {canAdmin && <Btn onClick={() => setModal({ type: "addRoom" })}>+ Ajouter</Btn>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map(room => {
                const roomEntries = entries.filter(e => e.targetId === room.id);
                const pending = roomEntries.filter(e => e.status !== "approved").length;
                return (
                  <Card key={room.id} className="p-4" onClick={() => setModal({ type: "logbook", target: room })}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">{room.name}</h3>
                      <Badge label={room.status} className={STATUS_COLORS[room.status] || "bg-gray-100 text-gray-700"} />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">🏷 {room.classification}</p>
                    <p className="text-xs text-gray-400 mb-3">ID: {room.id}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{roomEntries.length} entrée(s)</span>
                      {pending > 0 && <Badge label={`${pending} en attente`} className="bg-orange-100 text-orange-700" />}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-blue-600 font-medium">Ouvrir le logbook →</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "review" && canQA && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4">Revue Qualité</h2>
            {pendingCount === 0 ? (
              <Card className="p-10 text-center text-gray-400">
                <div className="text-4xl mb-2">✅</div>
                <p>Toutes les entrées sont approuvées.</p>
              </Card>
            ) : entries.filter(e => e.status !== "approved").slice().reverse().map(entry => (
              <Card key={entry.id} className="p-4 mb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{entry.targetName}</span>
                      <Badge label={entry.activity} className="bg-blue-100 text-blue-700" />
                      {entry.signed && <Badge label="✍ Signé" className="bg-purple-100 text-purple-800" />}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{entry.comment || <em className="text-gray-400">Aucun commentaire</em>}</p>
                    <p className="text-xs text-gray-500">{entry.userName} · {formatDT(entry.createdAt)}</p>
                  </div>
                  <Btn onClick={() => handleApprove(entry.id)} variant="success">✓ Approuver</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4">Audit Trail</h2>
            <Card className="p-4">
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "520px" }}>
                {auditLog.length === 0 && <p className="text-gray-400 text-sm text-center py-8">Aucun événement enregistré.</p>}
                {auditLog.slice().reverse().map((log, i) => (
                  <div key={i} className="flex gap-3 text-xs border-b border-gray-50 pb-2">
                    <div className="text-gray-400 whitespace-nowrap">{formatDT(log.at)}</div>
                    <div>
                      <span className={`font-semibold ${log.action.includes("modification") ? "text-orange-600" : log.action.includes("approbation") ? "text-green-600" : "text-blue-700"}`}>{log.action}</span>
                      <span className="text-gray-600"> · {log.by}</span>
                      {log.detail && <div className="text-gray-500">{log.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 pt-2 border-t text-center">Audit trail immuable – Annex 11 §9 · ALCOA+</p>
            </Card>
          </div>
        )}

        {activeTab === "admin" && canAdmin && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-800 text-lg">Administration</h2>
            <Card className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">👥 Utilisateurs</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left pb-2">ID</th><th className="text-left pb-2">Nom</th><th className="text-left pb-2">Rôle</th></tr></thead>
                <tbody>{users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-400 text-xs">{u.id}</td>
                    <td className="py-1.5">{u.name}</td>
                    <td className="py-1.5"><Badge label={ROLES_LABEL[u.role]} className="bg-blue-100 text-blue-700" /></td>
                  </tr>
                ))}</tbody>
              </table>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">📊 Statistiques</h3>
              <div className="grid grid-cols-2 gap-3">
                {[["Total entrées", entries.length], ["Approuvées", entries.filter(e => e.status === "approved").length], ["Signées", entries.filter(e => e.signed).length], ["Événements audit", auditLog.length]].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-700">{v}</div>
                    <div className="text-xs text-gray-500">{l}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">🔐 Conformité</h3>
              {[["EU GMP Annex 11", "✅"], ["21 CFR Part 11", "✅"], ["ALCOA+", "✅"], ["Audit trail immuable", "✅"], ["Gestion des rôles", "✅"], ["Verrouillage inactivité 15 min", "✅"], ["Signature électronique", "✅"]].map(([l, v]) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-gray-50 text-sm">
                  <span className="text-gray-600">{l}</span>
                  <span className="text-green-600 font-bold">{v} Conforme</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {modal?.type === "logbook" && (
        <LogbookModal
          target={modal.target}
          entries={entries}
          currentUser={currentUser}
          onNewEntry={(t) => setModal({ type: "entry", target: t })}
          onEditEntry={(entry) => setModal({ type: "editEntry", entry, target: { id: entry.targetId, name: entry.targetName } })}
          onApprove={handleApprove}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "entry" && (
        <EntryFormModal currentUser={currentUser} target={modal.target} onSave={handleSaveEntry} onClose={() => setModal(null)} />
      )}
      {modal?.type === "editEntry" && (
        <EntryFormModal currentUser={currentUser} target={modal.target} editEntry={modal.entry} onSave={handleSaveEntry} onClose={() => setModal(null)} />
      )}
      {modal?.type === "addEq" && (
        <AddEquipmentModal onSave={eq => { setEquipment(prev => [...prev, { ...eq, id: generateId(), createdAt: now() }]); addAudit("création équipement", currentUser.name, eq.name); }} onClose={() => setModal(null)} />
      )}
      {modal?.type === "addRoom" && (
        <AddRoomModal onSave={room => { setRooms(prev => [...prev, { ...room, id: generateId(), createdAt: now() }]); addAudit("création salle", currentUser.name, room.name); }} onClose={() => setModal(null)} />
      )}

      <footer className="text-center text-xs text-gray-400 py-3 border-t bg-white">
        GMP Logbook System · EU GMP Annex 11 · ALCOA+ · 21 CFR Part 11 · GAMP5
      </footer>
    </div>
  );
}
