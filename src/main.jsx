import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { assetsAPI, authAPI, stateAPI } from "./api/client";
import {
  LayoutDashboard, Building2, Boxes, ArrowRightLeft, CalendarClock, Wrench,
  ShieldCheck, BarChart3, Bell, LogOut, Plus, Search, X, Check, ChevronRight,
  AlertTriangle, Users, MapPin, Menu, Tag, Clock, Package, CheckCircle2,
  Filter, Download, Camera
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  FONTS                                                                  */
/* ---------------------------------------------------------------------- */
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
    .ff-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
    .ff-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
    .ff-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
  `}</style>
);

/* ---------------------------------------------------------------------- */
/*  CONSTANTS / SEED DATA                                                  */
/* ---------------------------------------------------------------------- */
const ROLES = ["Employee", "Department Head", "Asset Manager", "Admin"];

const ASSET_STATUSES = ["Available", "Allocated", "Reserved", "Under Maintenance", "Lost", "Retired", "Disposed"];

const STATUS_STYLE = {
  Available: "bg-emerald-950 text-emerald-400 border-emerald-800",
  Allocated: "bg-sky-950 text-sky-400 border-sky-800",
  Reserved: "bg-violet-950 text-violet-400 border-violet-800",
  "Under Maintenance": "bg-amber-950 text-amber-400 border-amber-800",
  Lost: "bg-rose-950 text-rose-400 border-rose-800",
  Retired: "bg-slate-800 text-slate-400 border-slate-700",
  Disposed: "bg-slate-800 text-slate-500 border-slate-700",
  Pending: "bg-amber-950 text-amber-400 border-amber-800",
  Approved: "bg-emerald-950 text-emerald-400 border-emerald-800",
  Rejected: "bg-rose-950 text-rose-400 border-rose-800",
  "Technician Assigned": "bg-sky-950 text-sky-400 border-sky-800",
  "In Progress": "bg-violet-950 text-violet-400 border-violet-800",
  Resolved: "bg-emerald-950 text-emerald-400 border-emerald-800",
  Upcoming: "bg-sky-950 text-sky-400 border-sky-800",
  Ongoing: "bg-violet-950 text-violet-400 border-violet-800",
  Completed: "bg-slate-800 text-slate-400 border-slate-700",
  Cancelled: "bg-rose-950 text-rose-400 border-rose-800",
  Verified: "bg-emerald-950 text-emerald-400 border-emerald-800",
  Missing: "bg-rose-950 text-rose-400 border-rose-800",
  Damaged: "bg-amber-950 text-amber-400 border-amber-800",
  Unchecked: "bg-slate-800 text-slate-400 border-slate-700",
  Active: "bg-emerald-950 text-emerald-400 border-emerald-800",
  Inactive: "bg-slate-800 text-slate-500 border-slate-700",
};

let _id = 1000;
const uid = (p) => `${p}${++_id}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowLocalInput = (offsetMin = 0) => {
  const d = new Date(Date.now() + offsetMin * 60000);
  d.setSeconds(0, 0);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
};
const fmtDT = (iso) => (iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const fmtD = (iso) => (iso ? new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "—");

const seedDepartments = () => ([
  { id: "dep-1", name: "Engineering", head: "emp-3", parent: null, status: "Active" },
  { id: "dep-2", name: "Operations", head: "emp-2", parent: null, status: "Active" },
  { id: "dep-3", name: "Facilities", head: null, parent: null, status: "Active" },
  { id: "dep-4", name: "Human Resources", head: null, parent: null, status: "Active" },
]);

const seedCategories = () => ([
  { id: "cat-1", name: "Electronics", extraField: "Warranty Period" },
  { id: "cat-2", name: "Furniture", extraField: null },
  { id: "cat-3", name: "Vehicles", extraField: "Insurance Expiry" },
  { id: "cat-4", name: "Equipment", extraField: null },
]);

const seedEmployees = () => ([
  { id: "emp-1", name: "Admin User", email: "admin@assetflow.io", department: "dep-2", role: "Admin", status: "Active" },
  { id: "emp-2", name: "Priya Nair", email: "priya@assetflow.io", department: "dep-2", role: "Asset Manager", status: "Active" },
  { id: "emp-3", name: "Rajesh Kumar", email: "raj@assetflow.io", department: "dep-1", role: "Department Head", status: "Active" },
  { id: "emp-4", name: "Ananya Iyer", email: "ananya@assetflow.io", department: "dep-1", role: "Employee", status: "Active" },
  { id: "emp-5", name: "Vikram Shah", email: "vikram@assetflow.io", department: "dep-3", role: "Employee", status: "Active" },
  { id: "emp-6", name: "Divya Menon", email: "divya@assetflow.io", department: "dep-4", role: "Employee", status: "Active" },
]);

const seedAssets = () => ([
  { id: "ast-1", tag: "AF-0001", name: "Dell Latitude 5440", category: "cat-1", serial: "SN-88213", acquisitionDate: "2024-11-02", cost: 92000, condition: "Good", location: "HQ - 3F", shared: false, status: "Allocated", allocatedTo: { type: "employee", id: "emp-4" }, expectedReturn: "2026-06-10", allocationHistory: [{ id: uid("h"), holder: "Ananya Iyer", from: "2025-01-05", to: null, note: "Initial allocation" }], maintenanceHistory: [] },
  { id: "ast-2", tag: "AF-0002", name: "Conference Room B2", category: "cat-4", serial: "SN-ROOMB2", acquisitionDate: "2023-03-14", cost: 0, condition: "Good", location: "HQ - 2F", shared: true, status: "Available", allocatedTo: null, expectedReturn: null, allocationHistory: [], maintenanceHistory: [] },
  { id: "ast-3", tag: "AF-0003", name: "Toyota Innova (TN-09 AB 4521)", category: "cat-3", serial: "SN-VEH4521", acquisitionDate: "2022-07-19", cost: 1450000, condition: "Fair", location: "HQ - Basement Parking", shared: true, status: "Reserved", allocatedTo: null, expectedReturn: null, allocationHistory: [], maintenanceHistory: [] },
  { id: "ast-4", tag: "AF-0004", name: "HP LaserJet Pro M404", category: "cat-1", serial: "SN-77102", acquisitionDate: "2024-01-22", cost: 21000, condition: "Needs Repair", location: "HQ - 1F", shared: false, status: "Under Maintenance", allocatedTo: null, expectedReturn: null, allocationHistory: [], maintenanceHistory: [{ id: uid("m"), issue: "Paper jam sensor faulty", date: "2026-07-08", status: "In Progress" }] },
  { id: "ast-5", tag: "AF-0005", name: "Ergonomic Office Chair", category: "cat-2", serial: "SN-CHR3391", acquisitionDate: "2023-09-11", cost: 8500, condition: "Good", location: "HQ - 3F", shared: false, status: "Allocated", allocatedTo: { type: "employee", id: "emp-3" }, expectedReturn: "2026-07-01", allocationHistory: [{ id: uid("h"), holder: "Rajesh Kumar", from: "2024-02-10", to: null, note: "Initial allocation" }], maintenanceHistory: [] },
  { id: "ast-6", tag: "AF-0006", name: "Projector Epson EB-X51", category: "cat-1", serial: "SN-55210", acquisitionDate: "2023-05-30", cost: 34000, condition: "Good", location: "HQ - 2F", shared: true, status: "Available", allocatedTo: null, expectedReturn: null, allocationHistory: [], maintenanceHistory: [] },
  { id: "ast-7", tag: "AF-0007", name: "Standing Desk", category: "cat-2", serial: "SN-DSK1187", acquisitionDate: "2022-12-05", cost: 15500, condition: "Good", location: "HQ - 1F", shared: false, status: "Retired", allocatedTo: null, expectedReturn: null, allocationHistory: [], maintenanceHistory: [] },
  { id: "ast-8", tag: "AF-0008", name: "MacBook Pro 14\"", category: "cat-1", serial: "SN-99871", acquisitionDate: "2025-02-18", cost: 189000, condition: "Excellent", location: "HQ - 3F", shared: false, status: "Allocated", allocatedTo: { type: "employee", id: "emp-6" }, expectedReturn: "2026-07-06", allocationHistory: [{ id: uid("h"), holder: "Divya Menon", from: "2025-02-20", to: null, note: "Initial allocation" }], maintenanceHistory: [] },
]);

const seedBookings = () => ([
  { id: "bk-1", assetId: "ast-2", bookedBy: "emp-4", start: "2026-07-12T09:00", end: "2026-07-12T10:00", status: "Upcoming", purpose: "Sprint planning" },
  { id: "bk-2", assetId: "ast-3", bookedBy: "emp-5", start: "2026-07-13T14:00", end: "2026-07-13T17:00", status: "Upcoming", purpose: "Client site visit" },
]);

const seedMaintenance = () => ([
  { id: "mr-1", assetId: "ast-4", raisedBy: "emp-3", issue: "Paper jam sensor faulty", priority: "Medium", status: "In Progress", technician: "Suresh (Facilities Vendor)", date: "2026-07-08" },
]);

const seedAudits = () => ([
  { id: "aud-1", scope: "Engineering / HQ - 3F", dateFrom: "2026-07-01", dateTo: "2026-07-15", auditors: ["emp-2", "emp-3"], status: "Open", items: [{ assetId: "ast-1", result: "Unchecked" }, { assetId: "ast-5", result: "Verified" }, { assetId: "ast-8", result: "Unchecked" }] },
]);

const seedNotifications = () => ([
  { id: "nt-1", type: "Maintenance Approved", message: "Maintenance request for AF-0004 moved to In Progress.", date: "2026-07-08T10:20", read: false },
  { id: "nt-2", type: "Booking Confirmed", message: "Conference Room B2 booked for Jul 12, 9:00–10:00.", date: "2026-07-10T08:05", read: false },
  { id: "nt-3", type: "Overdue Return Alert", message: "AF-0005 return was expected Jul 1 — please initiate return.", date: "2026-07-11T09:00", read: false },
]);

const seedLogs = () => ([
  { id: "lg-1", actor: "Priya Nair", action: "Registered asset AF-0008", timestamp: "2025-02-18T11:12" },
  { id: "lg-2", actor: "Rajesh Kumar", action: "Approved transfer of AF-0001 to Ananya Iyer", timestamp: "2025-01-05T09:41" },
  { id: "lg-3", actor: "Priya Nair", action: "Approved maintenance request for AF-0004", timestamp: "2026-07-08T10:19" },
]);

/* ---------------------------------------------------------------------- */
/*  PRIMITIVES                                                             */
/* ---------------------------------------------------------------------- */
const Badge = ({ children, tone }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-[11px] font-semibold uppercase tracking-wide ff-mono ${STATUS_STYLE[tone] || "bg-slate-800 text-slate-300 border-slate-700"}`}>
    {children}
  </span>
);

const AssetTagChip = ({ tag, status, size = "md" }) => (
  <div className={`inline-flex items-stretch rounded overflow-hidden border ${STATUS_STYLE[status]?.split(" ").slice(-1)[0] || "border-slate-700"} bg-slate-900`}>
    <div className={`flex items-center px-1.5 ${STATUS_STYLE[status] || "bg-slate-800"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
    </div>
    <div className={`px-2 ${size === "sm" ? "py-0.5 text-[11px]" : "py-1 text-xs"} ff-mono text-slate-200 font-semibold`}>{tag}</div>
  </div>
);

const Button = ({ children, onClick, variant = "primary", size = "md", icon: Icon, className = "", disabled }) => {
  const base = "inline-flex items-center justify-center gap-1.5 rounded font-semibold transition-colors ff-body disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-400 text-slate-950",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    ghost: "hover:bg-slate-800 text-slate-300",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white",
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${sizes} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
};

const Field = ({ label, children }) => (
  <label className="block mb-3">
    <span className="block text-xs font-semibold text-slate-400 mb-1 ff-body uppercase tracking-wide">{label}</span>
    {children}
  </label>
);

const inputCls = "w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500";

const TextInput = (props) => <input {...props} className={`${inputCls} ${props.className || ""}`} />;
const SelectInput = ({ children, ...props }) => <select {...props} className={`${inputCls} ${props.className || ""}`}>{children}</select>;
const TextArea = (props) => <textarea {...props} className={`${inputCls} ${props.className || ""}`} />;

const Modal = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4">
    <div className={`bg-slate-900 border border-slate-700 w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} rounded-t-xl sm:rounded-xl max-h-[92vh] overflow-y-auto`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <h3 className="ff-display font-semibold text-slate-100 text-base">{title}</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X size={18} /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-lg ${className}`}>{children}</div>
);

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-4">
    <Icon size={28} className="text-slate-600 mb-3" />
    <div className="text-slate-300 font-semibold ff-display">{title}</div>
    {sub && <div className="text-slate-500 text-sm mt-1 max-w-xs">{sub}</div>}
  </div>
);

/* ---------------------------------------------------------------------- */
/*  NAV CONFIG                                                             */
/* ---------------------------------------------------------------------- */
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ROLES },
  { key: "org", label: "Organization", icon: Building2, roles: ["Admin"] },
  { key: "assets", label: "Assets", icon: Boxes, roles: ROLES },
  { key: "allocation", label: "Allocation & Transfer", icon: ArrowRightLeft, roles: ROLES },
  { key: "booking", label: "Resource Booking", icon: CalendarClock, roles: ROLES },
  { key: "maintenance", label: "Maintenance", icon: Wrench, roles: ROLES },
  { key: "audit", label: "Audits", icon: ShieldCheck, roles: ["Admin", "Asset Manager", "Department Head"] },
  { key: "reports", label: "Reports & Analytics", icon: BarChart3, roles: ["Admin", "Asset Manager", "Department Head"] },
  { key: "notifications", label: "Notifications & Logs", icon: Bell, roles: ROLES },
];
const MOBILE_PRIMARY = ["dashboard", "assets", "booking", "maintenance"];

/* ---------------------------------------------------------------------- */
/*  APP                                                                    */
/* ---------------------------------------------------------------------- */
export default function AssetFlowApp() {
  const [users, setUsers] = useState(seedEmployees());
  const [departments, setDepartments] = useState(seedDepartments());
  const [categories, setCategories] = useState(seedCategories());
  const [assets, setAssets] = useState(seedAssets());
  const [transferRequests, setTransferRequests] = useState([]);
  const [bookings, setBookings] = useState(seedBookings());
  const [maintenance, setMaintenance] = useState(seedMaintenance());
  const [audits, setAudits] = useState(seedAudits());
  const [notifications, setNotifications] = useState(seedNotifications());
  const [logs, setLogs] = useState(seedLogs());
  const [nextAssetNum, setNextAssetNum] = useState(9);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const stateLoaded = useRef(false);

  useEffect(() => {
    stateAPI.get().then((saved) => {
      if (saved) {
        setUsers(saved.users || []); setDepartments(saved.departments || []); setCategories(saved.categories || []);
        setAssets(saved.assets || []); setTransferRequests(saved.transferRequests || []); setBookings(saved.bookings || []);
        setMaintenance(saved.maintenance || []); setAudits(saved.audits || []); setNotifications(saved.notifications || []);
        setLogs(saved.logs || []); setNextAssetNum(saved.nextAssetNum || 1);
      }
    }).catch((error) => console.error("Unable to load SQLite application state:", error))
      .finally(() => { stateLoaded.current = true; });
  }, []);

  useEffect(() => {
    if (!stateLoaded.current) return;
    const timer = setTimeout(() => stateAPI.save({ users, departments, categories, assets, transferRequests, bookings, maintenance, audits, notifications, logs, nextAssetNum }).catch((error) => console.error("Unable to save SQLite application state:", error)), 250);
    return () => clearTimeout(timer);
  }, [users, departments, categories, assets, transferRequests, bookings, maintenance, audits, notifications, logs, nextAssetNum]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const addLog = (action) => {
    setLogs((prev) => [{ id: uid("lg"), actor: currentUser?.name || "System", action, timestamp: new Date().toISOString() }, ...prev]);
  };
  const addNotification = (type, message) => {
    setNotifications((prev) => [{ id: uid("nt"), type, message, date: new Date().toISOString(), read: false }, ...prev]);
  };

  const deptName = (id) => departments.find((d) => d.id === id)?.name || "—";
  const catName = (id) => categories.find((c) => c.id === id)?.name || "—";
  const empName = (id) => users.find((u) => u.id === id)?.name || "—";
  const holderName = (allocatedTo) => {
    if (!allocatedTo) return null;
    return allocatedTo.type === "employee" ? empName(allocatedTo.id) : deptName(allocatedTo.id);
  };

  if (!currentUser) {
    return (
      <>
        <FontStyles />
        <LoginScreen
          users={users}
          setUsers={setUsers}
          departments={departments}
          onLogin={(id) => { setCurrentUserId(id); setScreen("dashboard"); }}
        />
      </>
    );
  }

  const nav = NAV_ITEMS.filter((n) => n.roles.includes(currentUser.role));

  const screenProps = {
    currentUser, users, setUsers, departments, setDepartments, categories, setCategories,
    assets, setAssets, transferRequests, setTransferRequests, bookings, setBookings,
    maintenance, setMaintenance, audits, setAudits, notifications, setNotifications,
    logs, addLog, addNotification, deptName, catName, empName, holderName,
    nextAssetNum, setNextAssetNum, showToast, setScreen,
  };

  return (
    <div className="min-h-screen bg-slate-950 ff-body flex">
      <FontStyles />
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-800 bg-slate-950 shrink-0">
        <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center">
            <Tag size={16} className="text-slate-950" />
          </div>
          <div>
            <div className="ff-display font-bold text-slate-100 leading-none text-lg">AssetFlow</div>
            <div className="text-[10px] text-slate-500 ff-mono tracking-wide">ENTERPRISE ERP</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => setScreen(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${screen === n.key ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"}`}
            >
              <n.icon size={17} />
              {n.label}
              {n.key === "notifications" && notifications.some((x) => !x.read) && (
                <span className="ml-auto w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-2 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-slate-200">
              {currentUser.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-slate-100 font-medium truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{currentUser.role}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={LogOut} className="w-full justify-start" onClick={() => setCurrentUserId(null)}>Log out</Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0">
        {/* Top bar (mobile) */}
        <div className="md:hidden sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-orange-500 flex items-center justify-center"><Tag size={14} className="text-slate-950" /></div>
            <span className="ff-display font-bold text-slate-100">AssetFlow</span>
          </div>
          <button onClick={() => setScreen("notifications")} className="relative text-slate-400">
            <Bell size={20} />
            {notifications.some((x) => !x.read) && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />}
          </button>
        </div>

        <main className="flex-1 min-w-0 px-4 sm:px-6 py-5 max-w-6xl w-full mx-auto">
          {screen === "dashboard" && <DashboardScreen {...screenProps} />}
          {screen === "org" && currentUser.role === "Admin" && <OrgSetupScreen {...screenProps} />}
          {screen === "assets" && <AssetDirectoryScreen {...screenProps} />}
          {screen === "allocation" && <AllocationScreen {...screenProps} />}
          {screen === "booking" && <BookingScreen {...screenProps} />}
          {screen === "maintenance" && <MaintenanceScreen {...screenProps} />}
          {screen === "audit" && <AuditScreen {...screenProps} />}
          {screen === "reports" && <ReportsScreen {...screenProps} />}
          {screen === "notifications" && <NotificationsScreen {...screenProps} />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950 border-t border-slate-800 flex items-stretch">
        {NAV_ITEMS.filter((n) => MOBILE_PRIMARY.includes(n.key) && n.roles.includes(currentUser.role)).map((n) => (
          <button key={n.key} onClick={() => setScreen(n.key)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium ${screen === n.key ? "text-orange-400" : "text-slate-500"}`}>
            <n.icon size={19} />
            {n.label.split(" ")[0]}
          </button>
        ))}
        <button onClick={() => setMobileMoreOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-slate-500">
          <Menu size={19} />
          More
        </button>
      </div>

      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/80 flex items-end" onClick={() => setMobileMoreOpen(false)}>
          <div className="bg-slate-900 border-t border-slate-700 w-full rounded-t-xl p-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
            {nav.map((n) => (
              <button key={n.key} onClick={() => { setScreen(n.key); setMobileMoreOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium ${screen === n.key ? "text-orange-400 bg-orange-500/10" : "text-slate-300"}`}>
                <n.icon size={18} /> {n.label}
              </button>
            ))}
            <button onClick={() => { setCurrentUserId(null); setMobileMoreOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-rose-400 mt-1 border-t border-slate-800">
              <LogOut size={18} /> Log out
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 text-slate-100 text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  LOGIN / SIGNUP                                                         */
/* ---------------------------------------------------------------------- */
function LoginScreen({ users, setUsers, departments, onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState(departments[0]?.id || "");
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);

  const doLogin = async () => {
    if (!password) return setError("Enter your password.");
    try {
      const { user } = await authAPI.login(email.trim(), password);
      const localUser = { ...user, department: user.department };
      setUsers((previous) => previous.some((item) => item.id === user.id)
        ? previous.map((item) => item.id === user.id ? { ...item, ...localUser } : item)
        : [...previous, { ...localUser, status: "Active" }]);
      setError("");
      onLogin(user.id);
    } catch (error) {
      setError(error.message || "Unable to log in.");
    }
  };

  const doSignup = async () => {
    if (!name.trim() || !email.trim() || !password) return setError("Fill in all fields to continue.");
    try {
      const { user } = await authAPI.signup(name.trim(), email.trim(), password, dept);
      const newUser = { ...user, department: user.department, status: "Active" };
      setUsers((previous) => [...previous, newUser]);
      setError("");
      onLogin(newUser.id);
    } catch (error) {
      setError(error.message || "Unable to create the account.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 ff-body flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded bg-orange-500 flex items-center justify-center"><Tag size={18} className="text-slate-950" /></div>
          <div>
            <div className="ff-display font-bold text-slate-100 text-xl leading-none">AssetFlow</div>
            <div className="text-[10px] text-slate-500 ff-mono tracking-widest">ENTERPRISE ERP</div>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex mb-5 bg-slate-950 rounded-md p-1 border border-slate-800">
            <button onClick={() => { setMode("login"); setError(""); }} className={`flex-1 py-2 text-sm font-semibold rounded ${mode === "login" ? "bg-orange-500 text-slate-950" : "text-slate-400"}`}>Log in</button>
            <button onClick={() => { setMode("signup"); setError(""); }} className={`flex-1 py-2 text-sm font-semibold rounded ${mode === "signup" ? "bg-orange-500 text-slate-950" : "text-slate-400"}`}>Sign up</button>
          </div>

          {mode === "signup" && (
            <Field label="Full name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Iyer" />
            </Field>
          )}
          <Field label="Work email">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          {mode === "signup" && (
            <Field label="Department">
              <SelectInput value={dept} onChange={(e) => setDept(e.target.value)}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </SelectInput>
            </Field>
          )}
          <Field label="Password">
            <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {error && <div className="text-rose-400 text-xs mb-3 flex items-center gap-1.5"><AlertTriangle size={13} /> {error}</div>}

          <Button className="w-full" onClick={mode === "login" ? doLogin : doSignup}>
            {mode === "login" ? "Log in" : "Create employee account"}
          </Button>

          {mode === "login" && (
            <button onClick={() => setForgot(true)} className="text-xs text-slate-500 hover:text-slate-300 mt-3 block mx-auto">Forgot password?</button>
          )}
          {mode === "signup" && (
            <p className="text-[11px] text-slate-500 mt-3 text-center">New accounts are created as Employee. Admins promote Department Heads and Asset Managers from the Employee Directory.</p>
          )}
          {forgot && (
            <div className="mt-3 text-xs bg-slate-950 border border-slate-800 rounded p-3 text-slate-400">
              A password reset link would be sent to your work email. <button className="text-orange-400 font-medium" onClick={() => setForgot(false)}>Dismiss</button>
            </div>
          )}
        </Card>

        <div className="mt-5">
          <div className="text-[11px] text-slate-600 uppercase tracking-wide mb-2 text-center">Quick demo login</div>
          <div className="grid grid-cols-2 gap-2">
            {users.filter((u) => ["emp-1", "emp-2", "emp-3", "emp-4"].includes(u.id)).map((u) => (
              <button key={u.id} onClick={() => { setEmail(u.email); setPassword("password"); setMode("login"); }} className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-md px-3 py-2 text-left">
                <div className="text-xs font-semibold text-slate-200">{u.role}</div>
                <div className="text-[11px] text-slate-500 truncate">{u.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  DASHBOARD                                                              */
/* ---------------------------------------------------------------------- */
function ScreenHeader({ title, sub, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
      <div>
        <h1 className="ff-display text-xl sm:text-2xl font-bold text-slate-100">{title}</h1>
        {sub && <p className="text-slate-500 text-sm mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, tone = "slate" }) {
  const toneMap = { slate: "text-slate-300", orange: "text-orange-400", rose: "text-rose-400", emerald: "text-emerald-400", sky: "text-sky-400" };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</span>
        <Icon size={15} className={toneMap[tone]} />
      </div>
      <div className={`ff-display text-2xl font-bold ${toneMap[tone]}`}>{value}</div>
    </Card>
  );
}

function DashboardScreen(props) {
  const { currentUser, assets, bookings, maintenance, transferRequests, holderName, setScreen, showToast } = props;
  const [quickModal, setQuickModal] = useState(null);

  const available = assets.filter((a) => a.status === "Available").length;
  const allocated = assets.filter((a) => a.status === "Allocated").length;
  const maintToday = maintenance.filter((m) => m.date === todayISO() || ["Pending", "Approved", "Technician Assigned", "In Progress"].includes(m.status)).length;
  const activeBookings = bookings.filter((b) => b.status === "Upcoming" || b.status === "Ongoing").length;
  const pendingTransfers = transferRequests.filter((t) => t.status === "Requested").length;

  const now = new Date();
  const overdueAssets = assets.filter((a) => a.expectedReturn && new Date(a.expectedReturn) < now && a.status === "Allocated");
  const upcomingReturns = assets.filter((a) => a.expectedReturn && new Date(a.expectedReturn) >= now && a.status === "Allocated")
    .sort((a, b) => new Date(a.expectedReturn) - new Date(b.expectedReturn));

  return (
    <div>
      <ScreenHeader title={`Welcome, ${currentUser.name.split(" ")[0]}`} sub={`${currentUser.role} · Real-time operational snapshot`} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Available" value={available} icon={Package} tone="emerald" />
        <KpiCard label="Allocated" value={allocated} icon={Users} tone="sky" />
        <KpiCard label="Maint. Today" value={maintToday} icon={Wrench} tone="orange" />
        <KpiCard label="Active Bookings" value={activeBookings} icon={CalendarClock} tone="sky" />
        <KpiCard label="Pending Transfers" value={pendingTransfers} icon={ArrowRightLeft} tone="orange" />
        <KpiCard label="Upcoming Returns" value={upcomingReturns.length} icon={Clock} tone="slate" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3 text-rose-400 font-semibold ff-display text-sm">
            <AlertTriangle size={16} /> Overdue Returns
          </div>
          {overdueAssets.length === 0 ? (
            <p className="text-slate-500 text-sm">Nothing overdue right now.</p>
          ) : (
            <div className="space-y-2">
              {overdueAssets.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-rose-950/40 border border-rose-900 rounded px-3 py-2">
                  <div>
                    <AssetTagChip tag={a.tag} status={a.status} size="sm" />
                    <div className="text-xs text-slate-400 mt-1">Held by {holderName(a.allocatedTo)} · due {fmtD(a.expectedReturn)}</div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3 text-slate-300 font-semibold ff-display text-sm">
            <Clock size={16} /> Upcoming Returns
          </div>
          {upcomingReturns.length === 0 ? (
            <p className="text-slate-500 text-sm">No returns scheduled.</p>
          ) : (
            <div className="space-y-2">
              {upcomingReturns.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2">
                  <div>
                    <AssetTagChip tag={a.tag} status={a.status} size="sm" />
                    <div className="text-xs text-slate-400 mt-1">Held by {holderName(a.allocatedTo)} · due {fmtD(a.expectedReturn)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="font-semibold ff-display text-sm text-slate-300 mb-3">Quick actions</div>
        <div className="flex flex-wrap gap-2">
          <Button icon={Plus} onClick={() => setQuickModal("register")}>Register Asset</Button>
          <Button variant="secondary" icon={CalendarClock} onClick={() => setScreen("booking")}>Book Resource</Button>
          <Button variant="secondary" icon={Wrench} onClick={() => setQuickModal("maintenance")}>Raise Maintenance Request</Button>
        </div>
      </Card>

      {quickModal === "register" && <RegisterAssetModal {...props} onClose={() => setQuickModal(null)} onDone={() => { setQuickModal(null); showToast("Asset registered."); setScreen("assets"); }} />}
      {quickModal === "maintenance" && <RaiseMaintenanceModal {...props} onClose={() => setQuickModal(null)} onDone={() => { setQuickModal(null); showToast("Maintenance request raised."); setScreen("maintenance"); }} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ORGANIZATION SETUP (ADMIN)                                             */
/* ---------------------------------------------------------------------- */
function OrgSetupScreen(props) {
  const { departments, setDepartments, categories, setCategories, users, setUsers, empName, addLog, showToast } = props;
  const [tab, setTab] = useState("dept");
  const [deptModal, setDeptModal] = useState(null);
  const [catModal, setCatModal] = useState(false);
  const [promoteUser, setPromoteUser] = useState(null);

  const toggleDeptStatus = (d) => {
    setDepartments((prev) => prev.map((x) => x.id === d.id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x));
  };

  const promote = (userId, role) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    addLog(`Promoted ${empName(userId)} to ${role}`);
    showToast(`${empName(userId)} is now ${role}.`);
    setPromoteUser(null);
  };

  const toggleUserStatus = (u) => {
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x));
  };

  return (
    <div>
      <ScreenHeader title="Organization Setup" sub="Master data that everything else depends on" />
      <div className="flex gap-1 mb-5 bg-slate-900 border border-slate-800 rounded-md p-1 w-fit">
        {[["dept", "Departments"], ["cat", "Asset Categories"], ["emp", "Employee Directory"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3.5 py-1.5 text-sm font-semibold rounded ${tab === k ? "bg-orange-500 text-slate-950" : "text-slate-400"}`}>{l}</button>
        ))}
      </div>

      {tab === "dept" && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-slate-400">{departments.length} departments</div>
            <Button size="sm" icon={Plus} onClick={() => setDeptModal({})}>Add department</Button>
          </div>
          <div className="space-y-2">
            {departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2.5">
                <div>
                  <div className="text-slate-100 font-medium text-sm">{d.name} {d.parent && <span className="text-slate-500 text-xs">— under {departments.find(p => p.id === d.parent)?.name}</span>}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Head: {d.head ? empName(d.head) : "Unassigned"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={d.status}>{d.status}</Badge>
                  <Button size="sm" variant="secondary" onClick={() => setDeptModal(d)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleDeptStatus(d)}>{d.status === "Active" ? "Deactivate" : "Activate"}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "cat" && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-slate-400">{categories.length} categories</div>
            <Button size="sm" icon={Plus} onClick={() => setCatModal(true)}>Add category</Button>
          </div>
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2.5">
                <div className="text-slate-100 font-medium text-sm">{c.name}</div>
                <div className="text-xs text-slate-500">{c.extraField ? `Extra field: ${c.extraField}` : "No extra fields"}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "emp" && (
        <Card className="p-4 overflow-x-auto">
          <div className="text-sm text-slate-400 mb-3">{users.length} employees · Promote to assign roles</div>
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase border-b border-slate-800">
                <th className="pb-2 font-semibold">Name</th>
                <th className="pb-2 font-semibold">Department</th>
                <th className="pb-2 font-semibold">Role</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-900">
                  <td className="py-2.5">
                    <div className="text-slate-100 font-medium">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-2.5 text-slate-400">{props.deptName(u.department)}</td>
                  <td className="py-2.5 text-slate-300">{u.role}</td>
                  <td className="py-2.5"><Badge tone={u.status}>{u.status}</Badge></td>
                  <td className="py-2.5 text-right space-x-1.5 whitespace-nowrap">
                    {u.role === "Employee" && <Button size="sm" variant="secondary" onClick={() => setPromoteUser(u)}>Promote</Button>}
                    <Button size="sm" variant="ghost" onClick={() => toggleUserStatus(u)}>{u.status === "Active" ? "Deactivate" : "Activate"}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {deptModal && <DepartmentModal departments={departments} setDepartments={setDepartments} users={users} initial={deptModal} onClose={() => setDeptModal(null)} />}
      {catModal && <CategoryModal setCategories={setCategories} onClose={() => setCatModal(false)} />}
      {promoteUser && (
        <Modal title={`Promote ${promoteUser.name}`} onClose={() => setPromoteUser(null)}>
          <p className="text-sm text-slate-400 mb-4">Choose a new role. This is the only place roles are assigned in AssetFlow.</p>
          <div className="space-y-2">
            <Button className="w-full" variant="secondary" onClick={() => promote(promoteUser.id, "Department Head")}>Make Department Head</Button>
            <Button className="w-full" variant="secondary" onClick={() => promote(promoteUser.id, "Asset Manager")}>Make Asset Manager</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DepartmentModal({ departments, setDepartments, users, initial, onClose }) {
  const isEdit = !!initial.id;
  const [name, setName] = useState(initial.name || "");
  const [head, setHead] = useState(initial.head || "");
  const [parent, setParent] = useState(initial.parent || "");

  const save = () => {
    if (!name.trim()) return;
    if (isEdit) {
      setDepartments((prev) => prev.map((d) => d.id === initial.id ? { ...d, name, head: head || null, parent: parent || null } : d));
    } else {
      setDepartments((prev) => [...prev, { id: uid("dep"), name, head: head || null, parent: parent || null, status: "Active" }]);
    }
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit department" : "Add department"} onClose={onClose}>
      <Field label="Department name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marketing" /></Field>
      <Field label="Department head (optional)">
        <SelectInput value={head} onChange={(e) => setHead(e.target.value)}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </SelectInput>
      </Field>
      <Field label="Parent department (optional)">
        <SelectInput value={parent} onChange={(e) => setParent(e.target.value)}>
          <option value="">None (top-level)</option>
          {departments.filter((d) => d.id !== initial.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </SelectInput>
      </Field>
      <Button className="w-full" onClick={save}>{isEdit ? "Save changes" : "Create department"}</Button>
    </Modal>
  );
}

function CategoryModal({ setCategories, onClose }) {
  const [name, setName] = useState("");
  const [hasExtra, setHasExtra] = useState(false);
  const [extraField, setExtraField] = useState("");
  const save = () => {
    if (!name.trim()) return;
    setCategories((prev) => [...prev, { id: uid("cat"), name, extraField: hasExtra ? extraField.trim() || null : null }]);
    onClose();
  };
  return (
    <Modal title="Add asset category" onClose={onClose}>
      <Field label="Category name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. IT Peripherals" /></Field>
      <label className="flex items-center gap-2 mb-3 text-sm text-slate-300">
        <input type="checkbox" checked={hasExtra} onChange={(e) => setHasExtra(e.target.checked)} className="accent-orange-500" />
        Add a category-specific field
      </label>
      {hasExtra && <Field label="Field name"><TextInput value={extraField} onChange={(e) => setExtraField(e.target.value)} placeholder="e.g. Warranty Period" /></Field>}
      <Button className="w-full" onClick={save}>Create category</Button>
    </Modal>
  );
}

/* ---------------------------------------------------------------------- */
/*  ASSET DIRECTORY                                                        */
/* ---------------------------------------------------------------------- */
function RegisterAssetModal(props, ) {
  const { categories, setAssets, nextAssetNum, setNextAssetNum, addLog, onClose, onDone } = props;
  const [form, setForm] = useState({ name: "", category: categories[0]?.id || "", serial: "", acquisitionDate: todayISO(), cost: "", condition: "Good", location: "", shared: false, photoName: "" });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name.trim() || !form.serial.trim() || !form.location.trim()) return;
    const tag = `AF-${String(nextAssetNum).padStart(4, "0")}`;
    let savedAsset;
    try {
      savedAsset = await assetsAPI.create({
        tag,
        name: form.name.trim(),
        category_id: form.category,
        serial: form.serial.trim(),
        acquisition_date: form.acquisitionDate,
        cost: Number(form.cost) || 0,
        condition: form.condition,
        location: form.location.trim(),
        shared: form.shared,
      });
    } catch (error) {
      console.error("Unable to save asset:", error);
      alert(error.message || "Unable to save the asset to SQLite.");
      return;
    }
    setAssets((prev) => [...prev, {
      id: savedAsset.id, tag, name: form.name.trim(), category: form.category, serial: form.serial.trim(),
      acquisitionDate: form.acquisitionDate, cost: Number(form.cost) || 0, condition: form.condition,
      location: form.location.trim(), shared: form.shared, status: "Available", allocatedTo: null,
      expectedReturn: null, photoName: form.photoName, allocationHistory: [], maintenanceHistory: [],
    }]);
    setNextAssetNum((n) => n + 1);
    addLog(`Registered asset ${tag} — ${form.name.trim()}`);
    onDone();
  };

  return (
    <Modal title="Register asset" onClose={onClose} wide>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Asset name"><TextInput value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Dell Latitude 5440" /></Field>
        <Field label="Category">
          <SelectInput value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </Field>
        <Field label="Auto-generated asset tag"><TextInput disabled value={`AF-${String(nextAssetNum).padStart(4, "0")}`} className="text-slate-500" /></Field>
        <Field label="Serial number"><TextInput value={form.serial} onChange={(e) => set("serial", e.target.value)} placeholder="SN-xxxxx" /></Field>
        <Field label="Acquisition date"><TextInput type="date" value={form.acquisitionDate} onChange={(e) => set("acquisitionDate", e.target.value)} /></Field>
        <Field label="Acquisition cost (₹, reporting only)"><TextInput type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="0" /></Field>
        <Field label="Condition">
          <SelectInput value={form.condition} onChange={(e) => set("condition", e.target.value)}>
            {["Excellent", "Good", "Fair", "Needs Repair"].map((c) => <option key={c}>{c}</option>)}
          </SelectInput>
        </Field>
        <Field label="Location"><TextInput value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. HQ - 3F" /></Field>
        <Field label="Photo / document">
          <label className="flex items-center gap-2 border border-dashed border-slate-700 rounded px-3 py-2 text-sm text-slate-500 cursor-pointer hover:border-orange-500/50">
            <Camera size={15} />
            {form.photoName || "Attach a file (optional)"}
            <input type="file" className="hidden" onChange={(e) => set("photoName", e.target.files?.[0]?.name || "")} />
          </label>
        </Field>
        <Field label="Shared / bookable resource">
          <label className="flex items-center gap-2 text-sm text-slate-300 pt-2">
            <input type="checkbox" checked={form.shared} onChange={(e) => set("shared", e.target.checked)} className="accent-orange-500" />
            Employees can book this asset by time slot
          </label>
        </Field>
      </div>
      <Button className="w-full mt-1" onClick={save}>Register asset</Button>
    </Modal>
  );
}

function AssetDetailDrawer({ asset, onClose, ...props }) {
  const { catName, holderName, setAssets, addLog, showToast } = props;
  const transition = async (newStatus) => {
    try {
      await assetsAPI.update(asset.id, {
        name: asset.name,
        condition: asset.condition,
        location: asset.location,
        shared: asset.shared,
        status: newStatus,
        allocated_to_type: asset.allocatedTo?.type || null,
        allocated_to_id: asset.allocatedTo?.id || null,
        expected_return: asset.expectedReturn || null,
      });
      setAssets((prev) => prev.map((a) => a.id === asset.id ? { ...a, status: newStatus } : a));
      addLog(`Changed ${asset.tag} status to ${newStatus}`);
      showToast(`${asset.tag} is now ${newStatus}.`);
    } catch (error) {
      console.error("Unable to update asset:", error);
      showToast(error.message || "Unable to update the database.");
    }
  };
  const canFlagLost = asset.status !== "Lost" && asset.status !== "Disposed";
  return (
    <Modal title={asset.name} onClose={onClose} wide>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <AssetTagChip tag={asset.tag} status={asset.status} />
        <Badge tone={asset.status}>{asset.status}</Badge>
        {asset.shared && <Badge tone="Active">Bookable</Badge>}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
        <InfoRow label="Category" value={catName(asset.category)} />
        <InfoRow label="Serial number" value={asset.serial} />
        <InfoRow label="Location" value={asset.location} />
        <InfoRow label="Condition" value={asset.condition} />
        <InfoRow label="Acquired" value={fmtD(asset.acquisitionDate)} />
        <InfoRow label="Cost (reporting only)" value={`₹${Number(asset.cost).toLocaleString("en-IN")}`} />
        <InfoRow label="Current holder" value={holderName(asset.allocatedTo) || "—"} />
        <InfoRow label="Expected return" value={asset.expectedReturn ? fmtD(asset.expectedReturn) : "—"} />
      </div>

      <div className="mb-5">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-2">Lifecycle actions</div>
        <div className="flex flex-wrap gap-2">
          {asset.status === "Available" && <Button size="sm" variant="secondary" onClick={() => transition("Under Maintenance")}>Send to Maintenance</Button>}
          {asset.status === "Under Maintenance" && <Button size="sm" variant="success" onClick={() => transition("Available")}>Mark Repaired → Available</Button>}
          {canFlagLost && <Button size="sm" variant="danger" onClick={() => transition("Lost")}>Flag as Lost</Button>}
          {asset.status !== "Retired" && asset.status !== "Disposed" && <Button size="sm" variant="ghost" onClick={() => transition("Retired")}>Retire</Button>}
          {asset.status === "Retired" && <Button size="sm" variant="ghost" onClick={() => transition("Disposed")}>Mark Disposed</Button>}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-2">Allocation history</div>
        {asset.allocationHistory.length === 0 ? <p className="text-slate-500 text-sm">No allocation history yet.</p> : (
          <div className="space-y-1.5">
            {asset.allocationHistory.map((h) => (
              <div key={h.id} className="text-sm bg-slate-950 border border-slate-800 rounded px-3 py-2 flex justify-between">
                <span className="text-slate-200">{h.holder}</span>
                <span className="text-slate-500 text-xs">{fmtD(h.from)} → {h.to ? fmtD(h.to) : "present"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase text-slate-500 font-semibold mb-2">Maintenance history</div>
        {asset.maintenanceHistory.length === 0 ? <p className="text-slate-500 text-sm">No maintenance history yet.</p> : (
          <div className="space-y-1.5">
            {asset.maintenanceHistory.map((m) => (
              <div key={m.id} className="text-sm bg-slate-950 border border-slate-800 rounded px-3 py-2 flex justify-between">
                <span className="text-slate-200">{m.issue}</span>
                <Badge tone={m.status}>{m.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase text-slate-500 font-semibold">{label}</div>
    <div className="text-slate-200">{value}</div>
  </div>
);

function AssetDirectoryScreen(props) {
  const { assets, categories, catName, currentUser, showToast } = props;
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const canRegister = ["Admin", "Asset Manager"].includes(currentUser.role);

  const filtered = assets.filter((a) => {
    const s = q.trim().toLowerCase();
    const matchesQ = !s || a.tag.toLowerCase().includes(s) || a.serial.toLowerCase().includes(s) || a.name.toLowerCase().includes(s) || a.location.toLowerCase().includes(s);
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesCat = !catFilter || a.category === catFilter;
    return matchesQ && matchesStatus && matchesCat;
  });

  return (
    <div>
      <ScreenHeader title="Asset Directory" sub={`${assets.length} assets registered`} action={canRegister && <Button icon={Plus} onClick={() => setRegisterOpen(true)}>Register asset</Button>} />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <TextInput className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by tag, serial, name, or location…" />
        </div>
        <Button variant="secondary" icon={Filter} onClick={() => setShowFilters((s) => !s)}>Filters</Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          <SelectInput className="w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {ASSET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
          <SelectInput className="w-auto" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Boxes} title="No assets match your search" sub="Try adjusting your filters or search terms." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-4 cursor-pointer hover:border-orange-500/40" >
              <div onClick={() => setDetail(a)}>
                <div className="flex justify-between items-start mb-2">
                  <AssetTagChip tag={a.tag} status={a.status} size="sm" />
                  {a.shared && <span title="Bookable" className="text-sky-400"><CalendarClock size={14} /></span>}
                </div>
                <div className="text-slate-100 font-semibold text-sm mb-1">{a.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-2"><MapPin size={11} /> {a.location}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{catName(a.category)}</span>
                  <Badge tone={a.status}>{a.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {registerOpen && <RegisterAssetModal {...props} onClose={() => setRegisterOpen(false)} onDone={() => { setRegisterOpen(false); showToast("Asset registered."); }} />}
      {detail && <AssetDetailDrawer asset={detail} onClose={() => setDetail(null)} {...props} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  ALLOCATION & TRANSFER                                                  */
/* ---------------------------------------------------------------------- */
function AllocateModal({ asset, ...props }) {
  const { users, departments, setAssets, addLog, addNotification, empName, showToast, onClose } = props;
  const [targetType, setTargetType] = useState("employee");
  const [targetId, setTargetId] = useState(users[0]?.id || "");
  const [expectedReturn, setExpectedReturn] = useState("");

  const alreadyHeld = asset.status === "Allocated";

  const allocate = () => {
    const label = targetType === "employee" ? empName(targetId) : props.deptName(targetId);
    setAssets((prev) => prev.map((a) => a.id === asset.id ? {
      ...a, status: "Allocated", allocatedTo: { type: targetType, id: targetId }, expectedReturn: expectedReturn || null,
      allocationHistory: [...a.allocationHistory, { id: uid("h"), holder: label, from: todayISO(), to: null, note: "Allocated" }],
    } : a));
    addLog(`Allocated ${asset.tag} to ${label}`);
    addNotification("Asset Assigned", `${asset.tag} was allocated to ${label}.`);
    showToast(`${asset.tag} allocated to ${label}.`);
    onClose();
  };

  return (
    <Modal title={`Allocate ${asset.tag}`} onClose={onClose}>
      {alreadyHeld ? (
        <div className="bg-rose-950/40 border border-rose-900 rounded p-3 mb-4 text-sm text-rose-300">
          This asset is currently held by <strong>{props.holderName(asset.allocatedTo)}</strong>. It can&apos;t be allocated again until it&apos;s returned or transferred. Use a <strong>Transfer Request</strong> instead.
        </div>
      ) : (
        <>
          <Field label="Allocate to">
            <div className="flex gap-2 mb-2">
              <button onClick={() => setTargetType("employee")} className={`flex-1 py-1.5 rounded text-sm font-semibold ${targetType === "employee" ? "bg-orange-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>Employee</button>
              <button onClick={() => setTargetType("department")} className={`flex-1 py-1.5 rounded text-sm font-semibold ${targetType === "department" ? "bg-orange-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>Department</button>
            </div>
            <SelectInput value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              {(targetType === "employee" ? users : departments).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </SelectInput>
          </Field>
          <Field label="Expected return date (optional)"><TextInput type="date" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} /></Field>
          <Button className="w-full" onClick={allocate}>Confirm allocation</Button>
        </>
      )}
    </Modal>
  );
}

function ReturnModal({ asset, ...props }) {
  const { setAssets, addLog, addNotification, showToast, onClose } = props;
  const [note, setNote] = useState("");
  const [condition, setCondition] = useState(asset.condition);
  const submit = () => {
    setAssets((prev) => prev.map((a) => a.id === asset.id ? {
      ...a, status: "Available", allocatedTo: null, expectedReturn: null, condition,
      allocationHistory: a.allocationHistory.map((h, i) => i === a.allocationHistory.length - 1 ? { ...h, to: todayISO(), note: `Returned — ${note || "no notes"}` } : h),
    } : a));
    addLog(`Returned ${asset.tag}`);
    addNotification("Overdue Return Alert".slice(0), `${asset.tag} was returned and is now Available.`);
    showToast(`${asset.tag} marked as returned.`);
    onClose();
  };
  return (
    <Modal title={`Return ${asset.tag}`} onClose={onClose}>
      <Field label="Condition at check-in">
        <SelectInput value={condition} onChange={(e) => setCondition(e.target.value)}>
          {["Excellent", "Good", "Fair", "Needs Repair"].map((c) => <option key={c}>{c}</option>)}
        </SelectInput>
      </Field>
      <Field label="Condition check-in notes"><TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any scratches, missing accessories, etc." /></Field>
      <Button className="w-full" onClick={submit}>Confirm return</Button>
    </Modal>
  );
}

function TransferRequestModal({ asset, ...props }) {
  const { users, setTransferRequests, addLog, addNotification, showToast, onClose, currentUser } = props;
  const [toEmployee, setToEmployee] = useState(users.find((u) => u.id !== asset.allocatedTo?.id)?.id || "");
  const submit = () => {
    setTransferRequests((prev) => [...prev, { id: uid("tr"), assetId: asset.id, fromHolder: props.holderName(asset.allocatedTo), toEmployeeId: toEmployee, status: "Requested", requestedBy: currentUser.name, date: todayISO() }]);
    addLog(`Requested transfer of ${asset.tag} to ${props.empName(toEmployee)}`);
    addNotification("Transfer Approved".replace("Approved", "Requested"), `Transfer request raised for ${asset.tag}.`);
    showToast("Transfer request submitted.");
    onClose();
  };
  return (
    <Modal title={`Request transfer — ${asset.tag}`} onClose={onClose}>
      <p className="text-sm text-slate-400 mb-3">Currently held by <strong className="text-slate-200">{props.holderName(asset.allocatedTo)}</strong>. This request needs approval from an Asset Manager or Department Head.</p>
      <Field label="Transfer to">
        <SelectInput value={toEmployee} onChange={(e) => setToEmployee(e.target.value)}>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </SelectInput>
      </Field>
      <Button className="w-full" onClick={submit}>Submit transfer request</Button>
    </Modal>
  );
}

function AllocationScreen(props) {
  const { assets, transferRequests, setTransferRequests, setAssets, currentUser, holderName, empName, addLog, addNotification, showToast } = props;
  const [allocateAsset, setAllocateAsset] = useState(null);
  const [returnAsset, setReturnAsset] = useState(null);
  const [transferAsset, setTransferAsset] = useState(null);

  const canManage = ["Admin", "Asset Manager", "Department Head"].includes(currentUser.role);
  const now = new Date();

  const approveTransfer = (tr) => {
    const asset = assets.find((a) => a.id === tr.assetId);
    const label = empName(tr.toEmployeeId);
    setAssets((prev) => prev.map((a) => a.id === tr.assetId ? {
      ...a, allocatedTo: { type: "employee", id: tr.toEmployeeId },
      allocationHistory: [...a.allocationHistory.map((h, i) => i === a.allocationHistory.length - 1 ? { ...h, to: todayISO() } : h), { id: uid("h"), holder: label, from: todayISO(), to: null, note: "Re-allocated via transfer" }],
    } : a));
    setTransferRequests((prev) => prev.map((t) => t.id === tr.id ? { ...t, status: "Approved" } : t));
    addLog(`Approved transfer of ${asset.tag} to ${label}`);
    addNotification("Transfer Approved", `${asset.tag} transferred to ${label}.`);
    showToast("Transfer approved and re-allocated.");
  };

  const rejectTransfer = (tr) => setTransferRequests((prev) => prev.map((t) => t.id === tr.id ? { ...t, status: "Rejected" } : t));

  return (
    <div>
      <ScreenHeader title="Asset Allocation & Transfer" sub="Who holds what, with conflict handling" />

      <div className="space-y-2 mb-6">
        {assets.filter((a) => a.status === "Allocated" || a.status === "Available").map((a) => {
          const overdue = a.expectedReturn && new Date(a.expectedReturn) < now;
          return (
            <Card key={a.id} className={`p-3.5 flex flex-wrap items-center justify-between gap-3 ${overdue ? "border-rose-900" : ""}`}>
              <div className="flex items-center gap-3">
                <AssetTagChip tag={a.tag} status={a.status} size="sm" />
                <div>
                  <div className="text-slate-100 text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-slate-500">
                    {a.status === "Allocated" ? `Held by ${holderName(a.allocatedTo)}${a.expectedReturn ? ` · due ${fmtD(a.expectedReturn)}` : ""}` : "Unallocated"}
                    {overdue && <span className="text-rose-400 font-semibold ml-1.5">OVERDUE</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                {a.status === "Available" && canManage && <Button size="sm" onClick={() => setAllocateAsset(a)}>Allocate</Button>}
                {a.status === "Allocated" && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setTransferAsset(a)}>Transfer Request</Button>
                    {canManage && <Button size="sm" variant="success" onClick={() => setReturnAsset(a)}>Mark Returned</Button>}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mb-2 font-semibold ff-display text-sm text-slate-300">Transfer requests</div>
      {transferRequests.length === 0 ? (
        <p className="text-slate-500 text-sm">No transfer requests yet.</p>
      ) : (
        <div className="space-y-2">
          {transferRequests.map((tr) => {
            const asset = assets.find((a) => a.id === tr.assetId);
            return (
              <Card key={tr.id} className="p-3.5 flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm">
                  <span className="text-slate-100 font-medium">{asset?.tag}</span>
                  <span className="text-slate-400"> — {tr.fromHolder} → {empName(tr.toEmployeeId)}</span>
                  <div className="text-xs text-slate-500">Requested by {tr.requestedBy} on {fmtD(tr.date)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={tr.status === "Requested" ? "Pending" : tr.status}>{tr.status}</Badge>
                  {tr.status === "Requested" && canManage && (
                    <>
                      <Button size="sm" variant="success" icon={Check} onClick={() => approveTransfer(tr)}>Approve</Button>
                      <Button size="sm" variant="danger" icon={X} onClick={() => rejectTransfer(tr)}>Reject</Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {allocateAsset && <AllocateModal asset={allocateAsset} {...props} onClose={() => setAllocateAsset(null)} />}
      {returnAsset && <ReturnModal asset={returnAsset} {...props} onClose={() => setReturnAsset(null)} />}
      {transferAsset && <TransferRequestModal asset={transferAsset} {...props} onClose={() => setTransferAsset(null)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  RESOURCE BOOKING                                                       */
/* ---------------------------------------------------------------------- */
function computeBookingStatus(b) {
  if (b.status === "Cancelled") return "Cancelled";
  const now = new Date(), s = new Date(b.start), e = new Date(b.end);
  if (now < s) return "Upcoming";
  if (now >= s && now <= e) return "Ongoing";
  return "Completed";
}

function NewBookingModal({ resource, ...props }) {
  const { bookings, setBookings, currentUser, addLog, addNotification, showToast, onClose } = props;
  const [start, setStart] = useState(nowLocalInput(60));
  const [end, setEnd] = useState(nowLocalInput(120));
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!start || !end || new Date(end) <= new Date(start)) return setError("End time must be after start time.");
    const overlap = bookings.some((b) => b.assetId === resource.id && computeBookingStatus(b) !== "Cancelled" &&
      new Date(start) < new Date(b.end) && new Date(end) > new Date(b.start));
    if (overlap) return setError("This slot overlaps with an existing booking for this resource.");
    setBookings((prev) => [...prev, { id: uid("bk"), assetId: resource.id, bookedBy: currentUser.id, start, end, status: "Upcoming", purpose: purpose.trim() || "—" }]);
    addLog(`Booked ${resource.tag} for ${fmtDT(start)}–${fmtDT(end)}`);
    addNotification("Booking Confirmed", `${resource.name} booked for ${fmtDT(start)}.`);
    showToast("Booking confirmed.");
    onClose();
  };

  return (
    <Modal title={`Book ${resource.name}`} onClose={onClose}>
      <Field label="Start time"><TextInput type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
      <Field label="End time"><TextInput type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
      <Field label="Purpose (optional)"><TextInput value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Sprint planning" /></Field>
      {error && <div className="text-rose-400 text-xs mb-3 flex items-center gap-1.5"><AlertTriangle size={13} /> {error}</div>}
      <Button className="w-full" onClick={submit}>Confirm booking</Button>
    </Modal>
  );
}

function BookingScreen(props) {
  const { assets, bookings, setBookings, empName, showToast } = props;
  const [resourceId, setResourceId] = useState("");
  const [bookOpen, setBookOpen] = useState(null);

  const resources = assets.filter((a) => a.shared);
  const selected = resources.find((r) => r.id === resourceId) || resources[0];

  const cancel = (b) => {
    setBookings((prev) => prev.map((x) => x.id === b.id ? { ...x, status: "Cancelled" } : x));
    showToast("Booking cancelled.");
  };

  return (
    <div>
      <ScreenHeader title="Resource Booking" sub="Time-slot booking with overlap protection" />
      {resources.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No bookable resources yet" sub="Mark an asset as shared/bookable in the Asset Directory to see it here." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {resources.map((r) => (
              <button key={r.id} onClick={() => setResourceId(r.id)} className={`px-3.5 py-2 rounded-md border text-sm font-medium ${selected?.id === r.id ? "bg-orange-500 border-orange-500 text-slate-950" : "bg-slate-900 border-slate-800 text-slate-300"}`}>
                {r.name}
              </button>
            ))}
          </div>

          {selected && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AssetTagChip tag={selected.tag} status={selected.status} />
                  <span className="text-slate-100 font-semibold">{selected.name}</span>
                </div>
                <Button size="sm" icon={Plus} onClick={() => setBookOpen(selected)}>New booking</Button>
              </div>
              <div className="space-y-2">
                {bookings.filter((b) => b.assetId === selected.id).sort((a, b) => new Date(a.start) - new Date(b.start)).map((b) => {
                  const status = computeBookingStatus(b);
                  return (
                    <div key={b.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2.5 flex-wrap gap-2">
                      <div>
                        <div className="text-slate-100 text-sm font-medium">{fmtDT(b.start)} → {fmtDT(b.end)}</div>
                        <div className="text-xs text-slate-500">{b.purpose} · booked by {empName(b.bookedBy)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={status}>{status}</Badge>
                        {status === "Upcoming" && <Button size="sm" variant="danger" onClick={() => cancel(b)}>Cancel</Button>}
                      </div>
                    </div>
                  );
                })}
                {bookings.filter((b) => b.assetId === selected.id).length === 0 && <p className="text-slate-500 text-sm">No bookings yet for this resource.</p>}
              </div>
            </Card>
          )}
        </>
      )}
      {bookOpen && <NewBookingModal resource={bookOpen} {...props} onClose={() => setBookOpen(null)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  MAINTENANCE                                                            */
/* ---------------------------------------------------------------------- */
function RaiseMaintenanceModal(props) {
  const { assets, setMaintenance, currentUser, addLog, addNotification, onClose, onDone } = props;
  const [assetId, setAssetId] = useState(assets[0]?.id || "");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [photoName, setPhotoName] = useState("");

  const submit = () => {
    if (!issue.trim()) return;
    const asset = assets.find((a) => a.id === assetId);
    setMaintenance((prev) => [...prev, { id: uid("mr"), assetId, raisedBy: currentUser.id, issue: issue.trim(), priority, status: "Pending", technician: null, date: todayISO(), photoName }]);
    addLog(`Raised maintenance request for ${asset.tag}`);
    addNotification("Maintenance Approved".replace("Approved", "Requested"), `Maintenance requested for ${asset.tag}.`);
    onDone();
  };

  return (
    <Modal title="Raise maintenance request" onClose={onClose}>
      <Field label="Asset">
        <SelectInput value={assetId} onChange={(e) => setAssetId(e.target.value)}>
          {assets.filter((a) => a.status !== "Disposed").map((a) => <option key={a.id} value={a.id}>{a.tag} — {a.name}</option>)}
        </SelectInput>
      </Field>
      <Field label="Describe the issue"><TextArea rows={3} value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="What's wrong with this asset?" /></Field>
      <Field label="Priority">
        <SelectInput value={priority} onChange={(e) => setPriority(e.target.value)}>
          {["Low", "Medium", "High", "Critical"].map((p) => <option key={p}>{p}</option>)}
        </SelectInput>
      </Field>
      <Field label="Attach photo (optional)">
        <label className="flex items-center gap-2 border border-dashed border-slate-700 rounded px-3 py-2 text-sm text-slate-500 cursor-pointer hover:border-orange-500/50">
          <Camera size={15} /> {photoName || "Attach a photo"}
          <input type="file" className="hidden" onChange={(e) => setPhotoName(e.target.files?.[0]?.name || "")} />
        </label>
      </Field>
      <Button className="w-full" onClick={submit}>Submit request</Button>
    </Modal>
  );
}

function MaintenanceScreen(props) {
  const { assets, maintenance, setMaintenance, setAssets, currentUser, empName, addLog, addNotification, showToast } = props;
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [techInput, setTechInput] = useState({});

  const canApprove = ["Admin", "Asset Manager"].includes(currentUser.role);
  const assetTag = (id) => assets.find((a) => a.id === id)?.tag || "—";

  const advance = (mr, action) => {
    const asset = assets.find((a) => a.id === mr.assetId);
    if (action === "approve") {
      setMaintenance((p) => p.map((m) => m.id === mr.id ? { ...m, status: "Approved" } : m));
      setAssets((p) => p.map((a) => a.id === mr.assetId ? { ...a, status: "Under Maintenance", maintenanceHistory: [...a.maintenanceHistory, { id: uid("m"), issue: mr.issue, date: todayISO(), status: "Approved" }] } : a));
      addLog(`Approved maintenance request for ${asset.tag}`);
      addNotification("Maintenance Approved", `Maintenance approved for ${asset.tag}. Status set to Under Maintenance.`);
      showToast("Request approved.");
    } else if (action === "reject") {
      setMaintenance((p) => p.map((m) => m.id === mr.id ? { ...m, status: "Rejected" } : m));
      addNotification("Maintenance Rejected", `Maintenance request rejected for ${asset.tag}.`);
      showToast("Request rejected.");
    } else if (action === "assign") {
      const tech = techInput[mr.id] || "Unassigned Technician";
      setMaintenance((p) => p.map((m) => m.id === mr.id ? { ...m, status: "Technician Assigned", technician: tech } : m));
      showToast("Technician assigned.");
    } else if (action === "progress") {
      setMaintenance((p) => p.map((m) => m.id === mr.id ? { ...m, status: "In Progress" } : m));
    } else if (action === "resolve") {
      setMaintenance((p) => p.map((m) => m.id === mr.id ? { ...m, status: "Resolved" } : m));
      setAssets((p) => p.map((a) => a.id === mr.assetId ? { ...a, status: "Available", maintenanceHistory: a.maintenanceHistory.map((h) => h.issue === mr.issue ? { ...h, status: "Resolved" } : h) } : a));
      addLog(`Resolved maintenance for ${asset.tag}`);
      addNotification("Maintenance Approved".replace("Approved", "Resolved"), `${asset.tag} is repaired and back to Available.`);
      showToast("Marked resolved — asset is Available again.");
    }
  };

  return (
    <div>
      <ScreenHeader title="Maintenance Management" sub="Route repairs through approval before work starts" action={<Button icon={Plus} onClick={() => setRaiseOpen(true)}>Raise request</Button>} />

      {maintenance.length === 0 ? (
        <EmptyState icon={Wrench} title="No maintenance requests" sub="Raised requests will appear here for approval and tracking." />
      ) : (
        <div className="space-y-2">
          {maintenance.slice().reverse().map((mr) => (
            <Card key={mr.id} className="p-4">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <AssetTagChip tag={assetTag(mr.assetId)} status="Under Maintenance" size="sm" />
                  <Badge tone={mr.priority === "Critical" || mr.priority === "High" ? "Missing" : "Unchecked"}>{mr.priority}</Badge>
                </div>
                <Badge tone={mr.status}>{mr.status}</Badge>
              </div>
              <div className="text-slate-200 text-sm mb-1">{mr.issue}</div>
              <div className="text-xs text-slate-500 mb-3">Raised by {empName(mr.raisedBy)} on {fmtD(mr.date)}{mr.technician ? ` · Technician: ${mr.technician}` : ""}</div>

              <div className="flex flex-wrap gap-2 items-center">
                {mr.status === "Pending" && canApprove && (
                  <>
                    <Button size="sm" variant="success" icon={Check} onClick={() => advance(mr, "approve")}>Approve</Button>
                    <Button size="sm" variant="danger" icon={X} onClick={() => advance(mr, "reject")}>Reject</Button>
                  </>
                )}
                {mr.status === "Approved" && canApprove && (
                  <>
                    <TextInput placeholder="Technician name" className="w-48" value={techInput[mr.id] || ""} onChange={(e) => setTechInput((p) => ({ ...p, [mr.id]: e.target.value }))} />
                    <Button size="sm" onClick={() => advance(mr, "assign")}>Assign technician</Button>
                  </>
                )}
                {mr.status === "Technician Assigned" && canApprove && <Button size="sm" onClick={() => advance(mr, "progress")}>Mark In Progress</Button>}
                {mr.status === "In Progress" && canApprove && <Button size="sm" variant="success" onClick={() => advance(mr, "resolve")}>Mark Resolved</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {raiseOpen && <RaiseMaintenanceModal {...props} onClose={() => setRaiseOpen(false)} onDone={() => { setRaiseOpen(false); showToast("Maintenance request raised."); }} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  AUDIT                                                                   */
/* ---------------------------------------------------------------------- */
function NewAuditModal(props) {
  const { users, setAudits, addLog, onClose } = props;
  const [scope, setScope] = useState("");
  const [dateFrom, setDateFrom] = useState(todayISO());
  const [dateTo, setDateTo] = useState(todayISO());
  const [auditors, setAuditors] = useState([]);
  const toggleAuditor = (id) => setAuditors((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const create = () => {
    if (!scope.trim() || auditors.length === 0) return;
    setAudits((prev) => [...prev, { id: uid("aud"), scope: scope.trim(), dateFrom, dateTo, auditors, status: "Open", items: props.assets.map((a) => ({ assetId: a.id, result: "Unchecked" })) }]);
    addLog(`Created audit cycle: ${scope.trim()}`);
    onClose();
  };

  return (
    <Modal title="Create audit cycle" onClose={onClose} wide>
      <Field label="Scope (department / location)"><TextInput value={scope} onChange={(e) => setScope(e.target.value)} placeholder="e.g. Engineering / HQ - 3F" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date"><TextInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></Field>
        <Field label="End date"><TextInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></Field>
      </div>
      <Field label="Assign auditors">
        <div className="flex flex-wrap gap-2">
          {users.map((u) => (
            <button key={u.id} onClick={() => toggleAuditor(u.id)} className={`px-2.5 py-1.5 rounded text-xs font-medium border ${auditors.includes(u.id) ? "bg-orange-500 border-orange-500 text-slate-950" : "bg-slate-900 border-slate-700 text-slate-400"}`}>
              {u.name}
            </button>
          ))}
        </div>
      </Field>
      <Button className="w-full mt-2" onClick={create}>Create audit cycle</Button>
    </Modal>
  );
}

function AuditDetailModal({ audit, ...props }) {
  const { assets, setAudits, addLog, showToast, onClose } = props;
  const setResult = (assetId, result) => {
    setAudits((prev) => prev.map((a) => a.id === audit.id ? { ...a, items: a.items.map((it) => it.assetId === assetId ? { ...it, result } : it) } : a));
  };
  const discrepancies = audit.items.filter((it) => it.result === "Missing" || it.result === "Damaged");

  const closeAudit = () => {
    setAudits((prev) => prev.map((a) => a.id === audit.id ? { ...a, status: "Closed" } : a));
    props.setAssets((prev) => prev.map((asset) => {
      const item = audit.items.find((it) => it.assetId === asset.id);
      if (item?.result === "Missing") return { ...asset, status: "Lost" };
      return asset;
    }));
    addLog(`Closed audit cycle: ${audit.scope}`);
    showToast("Audit cycle closed. Confirmed-missing assets marked Lost.");
    onClose();
  };

  return (
    <Modal title={audit.scope} onClose={onClose} wide>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge tone={audit.status === "Open" ? "Pending" : "Completed"}>{audit.status}</Badge>
        <span className="text-xs text-slate-500">{fmtD(audit.dateFrom)} – {fmtD(audit.dateTo)}</span>
        <span className="text-xs text-slate-500">· Auditors: {audit.auditors.map((id) => props.empName(id)).join(", ")}</span>
      </div>

      <div className="space-y-2 mb-5">
        {audit.items.map((it) => {
          const asset = assets.find((a) => a.id === it.assetId);
          if (!asset) return null;
          return (
            <div key={it.assetId} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AssetTagChip tag={asset.tag} status={asset.status} size="sm" />
                <span className="text-sm text-slate-300">{asset.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {audit.status === "Open" ? (
                  ["Verified", "Missing", "Damaged"].map((r) => (
                    <button key={r} onClick={() => setResult(it.assetId, r)} className={`px-2 py-1 rounded text-[11px] font-semibold border ${it.result === r ? STATUS_STYLE[r] : "bg-slate-900 border-slate-700 text-slate-500"}`}>{r}</button>
                  ))
                ) : <Badge tone={it.result}>{it.result}</Badge>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-5">
        <div className="text-xs uppercase text-slate-500 font-semibold mb-2 flex items-center gap-1.5"><AlertTriangle size={13} className="text-rose-400" /> Discrepancy report ({discrepancies.length})</div>
        {discrepancies.length === 0 ? <p className="text-slate-500 text-sm">No discrepancies flagged.</p> : (
          <div className="space-y-1.5">
            {discrepancies.map((it) => {
              const asset = assets.find((a) => a.id === it.assetId);
              return <div key={it.assetId} className="flex justify-between bg-rose-950/30 border border-rose-900 rounded px-3 py-2 text-sm"><span className="text-slate-200">{asset?.tag} — {asset?.name}</span><Badge tone={it.result}>{it.result}</Badge></div>;
            })}
          </div>
        )}
      </div>

      {audit.status === "Open" && <Button className="w-full" variant="danger" onClick={closeAudit}>Close audit cycle</Button>}
    </Modal>
  );
}

function AuditScreen(props) {
  const { audits, currentUser, empName } = props;
  const [newOpen, setNewOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const canCreate = ["Admin", "Asset Manager"].includes(currentUser.role);

  return (
    <div>
      <ScreenHeader title="Asset Audit" sub="Structured verification cycles" action={canCreate && <Button icon={Plus} onClick={() => setNewOpen(true)}>New audit cycle</Button>} />
      {audits.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No audit cycles yet" sub="Create a cycle to start verifying assets." />
      ) : (
        <div className="space-y-2">
          {audits.map((a) => {
            const discrepancies = a.items.filter((it) => it.result === "Missing" || it.result === "Damaged").length;
            const checked = a.items.filter((it) => it.result !== "Unchecked").length;
            return (
              <Card key={a.id} className="p-4 cursor-pointer hover:border-orange-500/40" onClick={() => setDetail(a)}>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="text-slate-100 font-semibold text-sm">{a.scope}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{fmtD(a.dateFrom)} – {fmtD(a.dateTo)} · Auditors: {a.auditors.map((id) => empName(id)).join(", ")}</div>
                  </div>
                  <Badge tone={a.status === "Open" ? "Pending" : "Completed"}>{a.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-2">{checked}/{a.items.length} assets checked {discrepancies > 0 && <span className="text-rose-400 font-semibold">· {discrepancies} discrepancies</span>}</div>
              </Card>
            );
          })}
        </div>
      )}
      {newOpen && <NewAuditModal {...props} onClose={() => setNewOpen(false)} />}
      {detail && <AuditDetailModal audit={detail} {...props} onClose={() => setDetail(null)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  REPORTS & ANALYTICS                                                    */
/* ---------------------------------------------------------------------- */
function Bar({ label, value, max, tone = "bg-orange-500" }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{label}</span><span className="font-semibold text-slate-300">{value}</span></div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${tone}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function ReportsScreen(props) {
  const { assets, maintenance, bookings, departments, categories, catName } = props;

  const statusCounts = ASSET_STATUSES.map((s) => ({ s, n: assets.filter((a) => a.status === s).length }));
  const maxStatus = Math.max(1, ...statusCounts.map((x) => x.n));

  const maintByCategory = categories.map((c) => ({ c: c.name, n: maintenance.filter((m) => assets.find((a) => a.id === m.assetId)?.category === c.id).length }));
  const maxMaint = Math.max(1, ...maintByCategory.map((x) => x.n));

  const deptAlloc = departments.map((d) => ({
    d: d.name,
    n: assets.filter((a) => (a.allocatedTo?.type === "department" && a.allocatedTo.id === d.id) || (a.allocatedTo?.type === "employee" && props.empName && props.users?.find(u => u.id === a.allocatedTo.id)?.department === d.id)).length,
  }));
  const maxDept = Math.max(1, ...deptAlloc.map((x) => x.n));

  const utilized = assets.filter((a) => a.status === "Allocated" || bookings.some((b) => b.assetId === a.id)).length;
  const idle = assets.length - utilized;

  const nearRetirement = assets.filter((a) => a.condition === "Fair" || a.condition === "Needs Repair");

  // simple booking heatmap: bookings grouped by hour bucket
  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({ h, n: bookings.filter((b) => new Date(b.start).getHours() === h).length }));
  const maxHour = Math.max(1, ...hourBuckets.map((x) => x.n));

  const exportCSV = () => {
    const rows = [["Tag", "Name", "Category", "Status", "Location", "Condition", "Cost"], ...assets.map((a) => [a.tag, a.name, catName(a.category), a.status, a.location, a.condition, a.cost])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "assetflow-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <ScreenHeader title="Reports & Analytics" sub="Operational insight across the asset lifecycle" action={<Button icon={Download} variant="secondary" onClick={exportCSV}>Export CSV</Button>} />

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4">
          <div className="font-semibold ff-display text-sm text-slate-300 mb-3">Asset status distribution</div>
          {statusCounts.map((x) => <Bar key={x.s} label={x.s} value={x.n} max={maxStatus} />)}
        </Card>
        <Card className="p-4">
          <div className="font-semibold ff-display text-sm text-slate-300 mb-3">Maintenance frequency by category</div>
          {maintByCategory.map((x) => <Bar key={x.c} label={x.c} value={x.n} max={maxMaint} tone="bg-amber-500" />)}
        </Card>
        <Card className="p-4">
          <div className="font-semibold ff-display text-sm text-slate-300 mb-3">Department-wise allocation</div>
          {deptAlloc.map((x) => <Bar key={x.d} label={x.d} value={x.n} max={maxDept} tone="bg-sky-500" />)}
        </Card>
        <Card className="p-4">
          <div className="font-semibold ff-display text-sm text-slate-300 mb-3">Utilization</div>
          <div className="flex items-center gap-6">
            <div><div className="ff-display text-2xl font-bold text-emerald-400">{utilized}</div><div className="text-xs text-slate-500">Utilized</div></div>
            <div><div className="ff-display text-2xl font-bold text-slate-400">{idle}</div><div className="text-xs text-slate-500">Idle</div></div>
          </div>
          <div className="mt-3 text-xs uppercase text-slate-500 font-semibold mb-1.5">Nearing retirement / needs attention</div>
          {nearRetirement.length === 0 ? <p className="text-slate-500 text-xs">None flagged.</p> : (
            <div className="space-y-1">
              {nearRetirement.map((a) => <div key={a.id} className="flex justify-between text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1.5"><span className="text-slate-300">{a.tag} — {a.name}</span><span className="text-amber-400">{a.condition}</span></div>)}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="font-semibold ff-display text-sm text-slate-300 mb-3">Resource booking heatmap (by hour of day)</div>
        <div className="flex items-end gap-1 h-24">
          {hourBuckets.map((x) => (
            <div key={x.h} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div className="w-full bg-orange-500 rounded-sm" style={{ height: `${(x.n / maxHour) * 80 + (x.n > 0 ? 6 : 1)}px` }} />
              {x.h % 4 === 0 && <span className="text-[9px] text-slate-600">{x.h}h</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  NOTIFICATIONS & LOGS                                                   */
/* ---------------------------------------------------------------------- */
function NotificationsScreen(props) {
  const { notifications, setNotifications, logs, currentUser } = props;
  const [tab, setTab] = useState("notifications");
  const canSeeAllLogs = ["Admin", "Asset Manager"].includes(currentUser.role);

  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div>
      <ScreenHeader title="Notifications & Activity Logs" sub="Stay informed without digging for updates" />
      <div className="flex gap-1 mb-5 bg-slate-900 border border-slate-800 rounded-md p-1 w-fit">
        {[["notifications", "Notifications"], ["logs", "Activity Logs"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3.5 py-1.5 text-sm font-semibold rounded ${tab === k ? "bg-orange-500 text-slate-950" : "text-slate-400"}`}>{l}</button>
        ))}
      </div>

      {tab === "notifications" && (
        <>
          <div className="flex justify-end mb-3">
            <Button size="sm" variant="ghost" onClick={markAllRead}>Mark all as read</Button>
          </div>
          {notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} onClick={() => markRead(n.id)} className={`p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 ${n.read ? "bg-slate-900 border-slate-800" : "bg-orange-500/5 border-orange-500/30"}`}>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />}
                  <div className={n.read ? "pl-5" : ""}>
                    <div className="text-sm text-slate-100 font-medium">{n.type}</div>
                    <div className="text-sm text-slate-400">{n.message}</div>
                    <div className="text-[11px] text-slate-600 mt-1">{fmtDT(n.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "logs" && (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-slate-500 text-xs uppercase border-b border-slate-800">
                <th className="pb-2 font-semibold">Actor</th>
                <th className="pb-2 font-semibold">Action</th>
                <th className="pb-2 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {(canSeeAllLogs ? logs : logs.filter((l) => l.actor === currentUser.name)).map((l) => (
                <tr key={l.id} className="border-b border-slate-900">
                  <td className="py-2.5 text-slate-200">{l.actor}</td>
                  <td className="py-2.5 text-slate-400">{l.action}</td>
                  <td className="py-2.5 text-slate-500 text-xs">{fmtDT(l.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<AssetFlowApp />);
}
