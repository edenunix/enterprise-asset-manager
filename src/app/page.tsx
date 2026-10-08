"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, Bell, Building2, CalendarClock, CheckCircle2,
  CircleDollarSign, ClipboardList, Download, FileBarChart, LayoutDashboard,
  Menu, Monitor, MoreHorizontal, Package, Plus, Search, Settings2, ShieldCheck,
  Truck, Wrench, X, Pencil, Trash2, Sparkles,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RecordItem = {
  id: string; name: string; category: string; department: string;
  date: string; value: number; status: string;
};
type Store = Record<string, RecordItem[]>;

const SEED: Store = {
  Patrimoine: [
    { id: "AST-2026-001", name: "MacBook Pro 14″", category: "Informatique", department: "Technologie", date: "2026-09-12", value: 185000, status: "En service" },
    { id: "AST-2026-002", name: "Toyota Corolla", category: "Véhicule", department: "Administration", date: "2026-09-08", value: 1850000, status: "En service" },
    { id: "AST-2026-003", name: "Imprimante HP LaserJet", category: "Équipement", department: "Comptabilité", date: "2026-09-03", value: 65000, status: "Maintenance" },
    { id: "AST-2026-004", name: "Dell OptiPlex 7020", category: "Informatique", department: "Ressources humaines", date: "2026-08-28", value: 95000, status: "En service" },
    { id: "AST-2026-005", name: "Onduleur APC 1500VA", category: "Équipement", department: "Technologie", date: "2026-08-21", value: 42000, status: "À vérifier" },
  ],
  Catégories: [
    { id: "CAT-001", name: "Informatique", category: "Type de bien", department: "Tous", date: "2026-10-01", value: 0, status: "Active" },
    { id: "CAT-002", name: "Véhicule", category: "Type de bien", department: "Tous", date: "2026-10-01", value: 0, status: "Active" },
    { id: "CAT-003", name: "Équipement", category: "Type de bien", department: "Tous", date: "2026-10-01", value: 0, status: "Active" },
    { id: "CAT-004", name: "Mobilier", category: "Type de bien", department: "Tous", date: "2026-10-01", value: 0, status: "Active" },
  ],
  Affectations: [],
  Maintenance: [
    { id: "MNT-001", name: "Diagnostic imprimante HP", category: "Préventive", department: "Comptabilité", date: "2026-10-05", value: 12000, status: "À planifier" },
    { id: "MNT-002", name: "Contrôle onduleur APC", category: "Inspection", department: "Technologie", date: "2026-10-07", value: 8000, status: "À planifier" },
  ],
  Finances: [
    { id: "FIN-001", name: "Acquisition MacBook Pro", category: "Acquisition", department: "Technologie", date: "2026-09-12", value: 185000, status: "Enregistrée" },
    { id: "FIN-002", name: "Acquisition Toyota Corolla", category: "Acquisition", department: "Administration", date: "2026-09-08", value: 1850000, status: "Enregistrée" },
  ],
};

const NAV = [
  { label: "Vue d'ensemble", icon: LayoutDashboard }, { label: "Patrimoine", icon: Package },
  { label: "Catégories", icon: ClipboardList }, { label: "Affectations", icon: Building2 },
  { label: "Maintenance", icon: Wrench }, { label: "Finances", icon: CircleDollarSign },
  { label: "Rapports", icon: FileBarChart }, { label: "Assistant IA", icon: Sparkles },
];
const money = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
const today = () => new Date().toISOString().slice(0, 10);
const makeId = (prefix: string, list: RecordItem[]) => `${prefix}-${String(Date.now()).slice(-6)}-${list.length + 1}`;

function Status({ value }: { value: string }) {
  const green = ["En service", "Active", "Enregistrée", "Terminée", "Affecté"];
  const amber = ["Maintenance", "À vérifier", "À planifier", "En cours", "En attente"];
  const style = green.includes(value) ? { backgroundColor: "#e9f6ee", color: "#257448" } : amber.includes(value) ? { backgroundColor: "#fff4df", color: "#98651b" } : { backgroundColor: "#fcebea", color: "#b74343" };
  return <span className="status-pill" style={style}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "currentColor" }} />{value}</span>;
}
function Brand() {
  return <div className="flex items-center gap-3 px-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: "#174b3a" }}><Building2 size={22} /></div><div><p className="text-sm font-bold tracking-tight">Enterprise</p><p className="text-xs" style={{ color: "#7d8984" }}>ASSET MANAGER</p></div></div>;
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("Vue d'ensemble");
  const [store, setStore] = useState<Store>(SEED);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [settingsName, setSettingsName] = useState("Workspace Admin");
  
  // États pour l'Assistant IA
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("enterprise-asset-manager-v1");
      if (raw) setStore({ ...SEED, ...JSON.parse(raw) });
      const savedName = localStorage.getItem("eam-admin-name");
      if (savedName) setSettingsName(savedName);
    } catch { /* Keep sample data if storage is unavailable. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem("enterprise-asset-manager-v1", JSON.stringify(store)); } catch { /* Storage may be disabled. */ }
  }, [store, ready]);

  const rows = store[activePage] ?? [];
  const assets = store.Patrimoine ?? [];
  const totalValue = assets.reduce((sum, item) => sum + item.value, 0);
  const maintenanceCount = (store.Maintenance ?? []).filter(item => item.status !== "Terminée").length;
  const filteredRows = useMemo(() => rows.filter(item => {
    const haystack = [item.id, item.name, item.category, item.department, item.status].join(" ").toLowerCase();
    return haystack.includes(query.trim().toLowerCase()) && (statusFilter === "Tous" || item.status === statusFilter);
  }), [rows, query, statusFilter]);
  function notify(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 4000); }

  async function handleAiQuery() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, patrimoine: assets })
      });
      const data = await res.json();
      if (data.result) {
        setAiResponse(data.result);
      } else if (data.error) {
        setAiResponse("Erreur : " + data.error);
      } else {
        setAiResponse("Réponse vide du serveur.");
      }
    } catch (err: any) {
      setAiResponse("Impossible de contacter l'assistant : " + (err.message || "Erreur réseau"));
    }
    setAiLoading(false);
  }

  function askForRecord(page: string, existing?: RecordItem) {
    const nouns: Record<string, string> = { Patrimoine: "bien", Catégories: "catégorie", Affectations: "affectation", Maintenance: "intervention", Finances: "transaction" };
    const noun = nouns[page] ?? "élément";
    const name = window.prompt(`Nom de ${noun} :`, existing?.name ?? "");
    if (name === null) return;
    if (!name.trim()) { notify("Le nom est obligatoire."); return; }
    const categoryDefault = existing?.category ?? (page === "Patrimoine" ? "Informatique" : page === "Maintenance" ? "Préventive" : page === "Finances" ? "Dépense" : "Général");
    const category = window.prompt("Catégorie / type :", categoryDefault);
    if (category === null) return;
    const department = window.prompt("Département / responsable :", existing?.department ?? "Administration");
    if (department === null) return;
    const valueInput = window.prompt("Valeur ou coût en DJF (0 si non applicable) :", String(existing?.value ?? 0));
    if (valueInput === null) return;
    const value = Number(valueInput);
    if (!Number.isFinite(value) || value < 0) { notify("La valeur doit être un nombre positif."); return; }
    const defaultStatus = existing?.status ?? (page === "Catégories" ? "Active" : page === "Maintenance" ? "À planifier" : page === "Finances" ? "Enregistrée" : page === "Affectations" ? "Affecté" : "En service");
    const status = window.prompt("Statut :", defaultStatus);
    if (status === null) return;
    const current = store[page] ?? [];
    const prefixes: Record<string, string> = { Patrimoine: "AST", Catégories: "CAT", Affectations: "AFF", Maintenance: "MNT", Finances: "FIN" };
    const prefix = prefixes[page] ?? "REC";
    const record: RecordItem = {
      id: existing?.id ?? makeId(prefix, current),
      name: name.trim(), category: category.trim() || "Général",
      department: department.trim() || "Non défini", date: existing?.date ?? today(), value,
      status: status.trim() || defaultStatus,
    };
    setStore(prev => ({ ...prev, [page]: existing ? (prev[page] ?? []).map(item => item.id === existing.id ? record : item) : [record, ...(prev[page] ?? [])] }));
    notify(existing ? `${noun[0].toUpperCase()}${noun.slice(1)} modifié(e).` : `${noun[0].toUpperCase()}${noun.slice(1)} ajouté(e).`);
  }
  function removeRecord(page: string, record: RecordItem) {
    if (!window.confirm(`Supprimer « ${record.name} » ? Cette action ne peut pas être annulée.`)) return;
    setStore(prev => ({ ...prev, [page]: (prev[page] ?? []).filter(item => item.id !== record.id) }));
    notify("Élément supprimé.");
  }
  function exportCsv(page = activePage) {
    const data = page === "Rapports" ? assets : (store[page] ?? []);
    const header = ["Identifiant", "Nom", "Catégorie", "Département / responsable", "Date", "Valeur (DJF)", "Statut"];
    const csvRows = data.map(item => [item.id, item.name, item.category, item.department, item.date, item.value, item.status]);
    const csv = [header, ...csvRows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = `${page.toLowerCase().replaceAll(" ", "-")}-${today()}.csv`; link.click(); URL.revokeObjectURL(url);
    notify(`Export CSV de ${data.length} élément(s) lancé.`);
  }
  function resetDemo() {
    if (!window.confirm("Réinitialiser toutes les données locales aux valeurs de démonstration ?")) return;
    setStore(SEED); setQuery(""); setStatusFilter("Tous"); notify("Données de démonstration restaurées.");
  }

  const isOverview = activePage === "Vue d'ensemble";
  const isReports = activePage === "Rapports";
  const isAiAssistant = activePage === "Assistant IA";
  const categories = [...new Set(assets.map(item => item.category))];
  const chartData = [
    { month: "Avr", value: Math.round(totalValue * 0.72) }, { month: "Mai", value: Math.round(totalValue * 0.78) },
    { month: "Juin", value: Math.round(totalValue * 0.81) }, { month: "Juil", value: Math.round(totalValue * 0.88) },
    { month: "Août", value: Math.round(totalValue * 0.94) }, { month: "Sept", value: totalValue },
  ];

  return <div className="dashboard-grid">
    <aside className="sidebar">
      <div className="flex items-center justify-between"><Brand /><button aria-label="Ouvrir le menu" className="rounded-lg p-2 md:hidden" onClick={() => setMobileMenu(v => !v)}>{mobileMenu ? <X size={19} /> : <Menu size={19} />}</button></div>
      <div className={`${mobileMenu ? "block" : "hidden"} md:block`}>
        <div className="mt-10 px-3 text-[10px] font-semibold tracking-[0.16em] text-gray-400">WORKSPACE</div>
        <nav className="sidebar-nav mt-3 flex flex-col gap-1">{NAV.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActivePage(label); setMobileMenu(false); setQuery(""); setStatusFilter("Tous"); }} className={`nav-link ${activePage === label ? "active" : ""}`}><Icon size={18} strokeWidth={1.8} /><span className="text-[13px]">{label}</span>{label === "Maintenance" && maintenanceCount > 0 && <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">{maintenanceCount}</span>}</button>)}</nav>
        <div className="mt-9 px-3 text-[10px] font-semibold tracking-[0.16em] text-gray-400">SYSTEM</div>
        <button className={`nav-link mt-3 ${activePage === "Paramètres" ? "active" : ""}`} onClick={() => setActivePage("Paramètres")}><Settings2 size={18} /><span className="text-[13px]">Paramètres</span></button>
      </div>
      <div className="sidebar-footer mt-auto"><div className="rounded-xl p-4" style={{ background: "#f3f7f4", border: "1px solid #e6eee8" }}><div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck size={17} color="#24754d" /> Mode local activé</div><p className="mt-2 text-[11px] leading-5 text-gray-500">Les données sont conservées dans ce navigateur. Elles ne sont pas encore synchronisées avec Supabase.</p></div><div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-5"><div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold" style={{ background: "#e2eee6", color: "#174b3a" }}>AD</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{settingsName}</p><p className="mt-1 text-[11px] text-gray-400">Administrateur local</p></div><MoreHorizontal size={17} color="#89958e" /></div></div>
    </aside>
    <main className="main-content">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs text-gray-400"><span>Workspace</span><span>/</span><span className="font-medium text-gray-600">{activePage}</span></div><h1 className="text-2xl font-bold tracking-tight">{isOverview ? "Vue d'ensemble" : activePage === "Patrimoine" ? "Gestion du patrimoine" : activePage}</h1><p className="mt-1 text-[13px] text-gray-500">{isOverview ? "Voici l'état de votre patrimoine aujourd'hui." : `Consultez et gérez votre espace ${activePage.toLowerCase()}.`}</p></div>
        <div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 sm:flex"><CalendarClock size={15} />{new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div><div className="relative"><button aria-label="Notifications" onClick={() => setShowNotifications(v => !v)} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"><Bell size={18} />{maintenanceCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />}</button>{showNotifications && <div className="panel absolute right-0 top-12 z-20 w-72 p-4 shadow-lg"><p className="font-semibold">Notifications</p><p className="mt-3 text-xs leading-5 text-gray-500">{maintenanceCount ? `${maintenanceCount} intervention(s) restent à traiter.` : "Aucune intervention en attente."}</p><button className="mt-3 text-xs font-semibold text-emerald-800" onClick={() => { setActivePage("Maintenance"); setShowNotifications(false); }}>Voir la maintenance →</button></div>}</div>{!isOverview && !isReports && !isAiAssistant && activePage !== "Paramètres" && <button onClick={() => askForRecord(activePage)} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white" style={{ background: "#174b3a" }}><Plus size={16} /><span>Nouveau</span></button>}</div>
      </header>
      {message && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800"><CheckCircle2 size={17} /><span>{message}</span><button className="ml-auto" onClick={() => setMessage("")}><X size={16} /></button></div>}
      
      {isAiAssistant ? (
        <section className="panel p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} color="#174b3a" />
            <h2 className="text-lg font-bold">Assistant Intelligent Gemini</h2>
          </div>
          <p className="text-xs text-gray-500">Posez vos questions en langage naturel sur votre inventaire et vos actifs.</p>
          
          <div className="mt-6 flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ex: Quel est le matériel le plus cher ? Résume l'état du parc informatique..."
              className="flex-1 rounded-lg border border-gray-200 px-3 py-3 text-xs outline-none focus:border-emerald-700"
            />
            <button
              onClick={handleAiQuery}
              disabled={aiLoading}
              className="rounded-xl px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: "#174b3a" }}
            >
              {aiLoading ? "Analyse..." : "Demander à l'IA"}
            </button>
          </div>

          {aiResponse && (
            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-2">Réponse de l'assistant :</h3>
              <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
        </section>
      ) : isOverview ? <>
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Valeur du patrimoine" value={`${money(totalValue)} DJF`} icon={<CircleDollarSign size={20} color="#26744b" />} note="Valeur cumulée des biens" /><Metric title="Total des biens" value={String(assets.length)} icon={<Package size={20} color="#4168ad" />} note={`${categories.length} catégorie(s)`} /><Metric title="En maintenance" value={String(assets.filter(x => x.status === "Maintenance").length)} icon={<Wrench size={20} color="#b47b24" />} note={`${maintenanceCount} intervention(s) ouverte(s)`} /><Metric title="Coût des interventions" value={`${money((store.Maintenance ?? []).reduce((s, x) => s + x.value, 0))} DJF`} icon={<CalendarClock size={20} color="#8954aa" />} note="Montant enregistré" /></div>
        <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(270px,1fr)]"><section className="panel p-5"><h2 className="text-sm font-semibold">Évolution du patrimoine</h2><p className="mt-1 text-xs text-gray-400">Valeur indicative basée sur l'inventaire courant</p><div className="mt-5 h-[240px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 5, left: -18, bottom: 0 }}><defs><linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2b7856" stopOpacity={0.2} /><stop offset="95%" stopColor="#2b7856" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0ed" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#89958e", fontSize: 11 }} /><YAxis tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} axisLine={false} tickLine={false} tick={{ fill: "#89958e", fontSize: 11 }} /><Tooltip formatter={(value) => [`${money(Number(value))} DJF`, "Valeur"]} /><Area type="monotone" dataKey="value" stroke="#26744b" strokeWidth={2.5} fill="url(#assetGradient)" /></AreaChart></ResponsiveContainer></div></section>
          <section className="panel p-5"><h2 className="text-sm font-semibold">Répartition des biens</h2><p className="mt-1 text-xs text-gray-400">Par catégorie</p><div className="mt-6 space-y-5">{categories.map((category, index) => { const count = assets.filter(x => x.category === category).length; const percent = assets.length ? Math.round(count / assets.length * 100) : 0; const colors = ["#26744b", "#6e91d2", "#d9a34b", "#9b83c7", "#c76f6f"]; return <div key={category}><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-2 text-xs text-gray-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />{category}</span><span className="text-xs font-semibold">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full" style={{ width: `${percent}%`, background: colors[index % colors.length] }} /></div></div>; })}{categories.length === 0 && <p className="text-xs text-gray-400">Aucune catégorie enregistrée.</p>}</div><button onClick={() => setActivePage("Patrimoine")} className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Voir tous les biens <ArrowRight size={14} /></button></section></div>
        <section className="panel"><div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 className="text-sm font-semibold">Derniers biens enregistrés</h2><p className="mt-1 text-xs text-gray-400">Inventaire sauvegardé dans ce navigateur</p></div><button onClick={() => setActivePage("Patrimoine")} className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#26744b" }}>Voir le patrimoine <ArrowRight size={14} /></button></div><DataTable rows={assets.slice(0, 5)} onEdit={item => askForRecord("Patrimoine", item)} onDelete={item => removeRecord("Patrimoine", item)} /></section>
      </> : activePage === "Paramètres" ? <section className="panel p-6 sm:p-8"><h2 className="text-lg font-bold">Paramètres de l'espace</h2><p className="mt-2 text-sm text-gray-500">Personnalisez le nom affiché et gérez les données de démonstration locales.</p><div className="mt-6 max-w-lg"><label className="mb-2 block text-xs font-semibold">Nom de l'administrateur</label><input className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm" value={settingsName} onChange={e => setSettingsName(e.target.value)} /><button onClick={() => { localStorage.setItem("eam-admin-name", settingsName); notify("Paramètres enregistrés."); }} className="mt-3 rounded-xl px-4 py-3 text-xs font-semibold text-white" style={{ background: "#174b3a" }}>Enregistrer les paramètres</button></div><div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-900">Données locales</p><p className="mt-1 text-xs leading-5 text-amber-800">Les modifications sont enregistrées dans ce navigateur uniquement. Elles ne sont pas encore synchronisées avec Supabase et ne sont pas partagées avec d'autres utilisateurs.</p><button onClick={resetDemo} className="mt-4 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900">Réinitialiser les données de démonstration</button></div></section> : <section className="panel"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-5"><div><h2 className="text-sm font-semibold">{isReports ? "Rapports et exports" : activePage}</h2><p className="mt-1 text-xs text-gray-400">{isReports ? "Exportez les données courantes au format CSV." : `Gérez les éléments de la section ${activePage.toLowerCase()}.`}</p></div><div className="flex gap-2">{isReports ? <button onClick={() => exportCsv("Rapports")} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium"><Download size={15} /> Exporter l'inventaire</button> : <button onClick={() => exportCsv()} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium"><Download size={15} /> Exporter CSV</button>}{!isReports && <button onClick={() => askForRecord(activePage)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: "#174b3a" }}><Plus size={15} /> Ajouter</button>}</div></div>
        {isReports ? <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3"><ReportCard title="Inventaire du patrimoine" description={`${assets.length} biens · ${money(totalValue)} DJF`} onClick={() => exportCsv("Rapports")} /><ReportCard title="Maintenance" description={`${(store.Maintenance ?? []).length} interventions enregistrées`} onClick={() => exportCsv("Maintenance")} /><ReportCard title="Finances" description={`${(store.Finances ?? []).length} transactions enregistrées`} onClick={() => exportCsv("Finances")} /></div> : <><div className="flex flex-wrap gap-3 p-5"><div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3"><Search size={16} color="#89958e" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher..." className="w-full bg-transparent py-2.5 text-xs outline-none" /></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none"><option>Tous</option>{[...new Set(rows.map(item => item.status))].map(status => <option key={status}>{status}</option>)}</select></div><DataTable rows={filteredRows} onEdit={item => askForRecord(activePage, item)} onDelete={item => removeRecord(activePage, item)} /><div className="border-t border-gray-100 p-4 text-xs text-gray-400">{filteredRows.length} élément(s) · sauvegarde locale automatique</div></>}</section>}
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400"><span>Enterprise Asset Manager · Version 0.2.1</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Prototype local · stockage navigateur</span></footer>
    </main>
  </div>;
}

function Metric({ title, value, icon, note }: { title: string; value: string; icon: React.ReactNode; note: string }) {
  return <div className="metric-card"><div className="flex items-center justify-between gap-2"><span className="text-xs text-gray-500">{title}</span><div className="metric-icon" style={{ background: "#f0f5f1" }}>{icon}</div></div><p className="mt-4 text-2xl font-bold tracking-tight">{value}</p><div className="mt-3 flex items-center gap-1 text-[11px] text-gray-500"><Activity size={14} /><span>{note}</span></div></div>;
}
function DataTable({ rows, onEdit, onDelete }: { rows: RecordItem[]; onEdit: (item: RecordItem) => void; onDelete: (item: RecordItem) => void }) {
  return <div className="table-scroll"><table className="asset-table"><thead><tr><th>IDENTIFIANT / NOM</th><th>CATÉGORIE</th><th>DÉPARTEMENT / RESPONSABLE</th><th>DATE</th><th>VALEUR (DJF)</th><th>STATUT</th><th>ACTIONS</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">Aucun élément. Utilisez « Ajouter » pour commencer.</td></tr> : rows.map(item => <tr key={item.id}><td><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#f0f5f1", color: "#36704f" }}>{item.category.toLowerCase().includes("véhicule") ? <Truck size={17} /> : item.category.toLowerCase().includes("informatique") ? <Monitor size={17} /> : <Package size={17} />}</div><div><p className="text-xs font-semibold">{item.name}</p><p className="mt-1 text-[10px] text-gray-400">{item.id}</p></div></div></td><td className="text-xs text-gray-500">{item.category}</td><td className="text-xs text-gray-500">{item.department}</td><td className="text-xs text-gray-500">{item.date}</td><td className="text-xs font-semibold">{money(item.value)}</td><td><Status value={item.status} /></td><td><div className="flex items-center gap-1"><button aria-label={`Modifier ${item.name}`} title="Modifier" onClick={() => onEdit(item)} className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-800"><Pencil size={15} /></button><button aria-label={`Supprimer ${item.name}`} title="Supprimer" onClick={() => onDelete(item)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>;
}
function ReportCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-emerald-700 hover:bg-emerald-50/30"><div className="flex items-center justify-between"><FileBarChart size={21} color="#26744b" /><Download size={16} color="#89958e" /></div><p className="mt-4 text-sm font-semibold">{title}</p><p className="mt-2 text-xs text-gray-500">{description}</p><p className="mt-4 text-xs font-semibold text-emerald-800">Télécharger CSV →</p></button>;
}
