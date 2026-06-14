import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ship,
  ClipboardList,
  Wrench,
  FileDown,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Anchor,
  FileText,
} from "lucide-react";
import {
  exportBienBanKiemTra,
  exportBienBanNghiemThu,
  type CustomerInfo,
  type Equipment,
  type ServiceItem,
} from "@/lib/pdfExport";

type TabKey = "general" | "equipment" | "service" | "export";

const TABS: { key: TabKey; label: string; icon: typeof Ship }[] = [
  { key: "general", label: "General", icon: ClipboardList },
  { key: "equipment", label: "Equipment", icon: Anchor },
  { key: "service", label: "Services", icon: Wrench },
  { key: "export", label: "Export", icon: FileDown },
];

// ---- Mock pre-fill data ----
const INITIAL_CUSTOMER: CustomerInfo = {
  company: "CÔNG TY TNHH ĐẦU TƯ VẬN TẢI BIỂN PHƯƠNG NAM",
  vessel: "PHƯƠNG NAM 19 (HN-2495)",
  mmsi: "574013074",
  date: "09/06/2026",
  jobNumber: "695/26VNT",
};

const INITIAL_EQUIPMENTS: Equipment[] = [
  { id: "e1", type: "VHF", maker: "ICOM", model: "IC-M323", serial: "05014392" },
  { id: "e2", type: "AIS Class A", maker: "SAMYUNG", model: "SI-30A", serial: "21D3569" },
  { id: "e3", type: "EPIRB", maker: "CETC", model: "VEP-8", serial: "20050065" },
];

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "s1",
    description: "Dịch vụ kiểm tra, thử test trang thiết bị vô tuyến điện hàng hải",
    quantity: "01",
    unit: "Lần",
  },
  {
    id: "s2",
    description: "Dịch vụ kiểm tra, thử test thiết bị nhận dạng AIS",
    quantity: "01",
    unit: "Lần",
  },
];

const uid = () => Math.random().toString(36).slice(2, 9);

export function FieldServiceApp() {
  const [tab, setTab] = useState<TabKey>("general");
  const [customer, setCustomer] = useState<CustomerInfo>(INITIAL_CUSTOMER);
  const [equipments, setEquipments] = useState<Equipment[]>(INITIAL_EQUIPMENTS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [exporting, setExporting] = useState<"kt" | "nt" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const goTab = (dir: 1 | -1) => {
    const idx = TABS.findIndex((t) => t.key === tab);
    const next = TABS[Math.min(TABS.length - 1, Math.max(0, idx + dir))];
    if (next) setTab(next.key);
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleExport = async (which: "kt" | "nt") => {
    try {
      setExporting(which);
      const data = { customer, equipments, services };
      if (which === "kt") await exportBienBanKiemTra(data);
      else await exportBienBanNghiemThu(data);
      flash("PDF exported successfully");
    } catch (e) {
      console.error(e);
      flash("Export failed — check console");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Ship className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Field Service</div>
              <div className="text-[11px] text-slate-500">Marine Radio Inspection</div>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
            Job · {customer.jobNumber}
          </div>
        </div>

        {/* ---------- Tabs ---------- */}
        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 pb-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex flex-1 min-w-[88px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ---------- Body ---------- */}
      <main className="mx-auto max-w-3xl px-4 py-5 pb-28">
        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {tab === "general" && (
              <GeneralForm value={customer} onChange={setCustomer} />
            )}
            {tab === "equipment" && (
              <EquipmentTable
                items={equipments}
                onChange={setEquipments}
                makeNew={() => ({ id: uid(), type: "", maker: "", model: "", serial: "" })}
              />
            )}
            {tab === "service" && (
              <ServiceTable
                items={services}
                onChange={setServices}
                makeNew={() => ({ id: uid(), description: "", quantity: "01", unit: "Lần" })}
              />
            )}
            {tab === "export" && (
              <ExportPanel
                exporting={exporting}
                onExport={handleExport}
                customer={customer}
                equipmentCount={equipments.length}
                serviceCount={services.length}
              />
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      {/* ---------- Sticky nav controls ---------- */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <button
            onClick={() => goTab(-1)}
            disabled={tab === TABS[0].key}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-1.5">
            {TABS.map((t) => (
              <span
                key={t.key}
                className={`h-1.5 rounded-full transition-all ${
                  t.key === tab ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => goTab(1)}
            disabled={tab === TABS[TABS.length - 1].key}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ---------- Toast ---------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   General Info form
   ========================================================================= */
function GeneralForm({
  value,
  onChange,
}: {
  value: CustomerInfo;
  onChange: (v: CustomerInfo) => void;
}) {
  const set = (k: keyof CustomerInfo) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });

  return (
    <Card title="General Information" subtitle="Customer & vessel details">
      <Field label="Company">
        <input
          className={inputCls}
          value={value.company}
          onChange={set("company")}
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Vessel">
          <input className={inputCls} value={value.vessel} onChange={set("vessel")} />
        </Field>
        <Field label="MMSI">
          <input className={inputCls} value={value.mmsi} onChange={set("mmsi")} />
        </Field>
        <Field label="Date">
          <input className={inputCls} value={value.date} onChange={set("date")} />
        </Field>
        <Field label="Job Number">
          <input
            className={inputCls}
            value={value.jobNumber}
            onChange={set("jobNumber")}
          />
        </Field>
      </div>
    </Card>
  );
}

/* =========================================================================
   Equipment grid (Google-Sheets style)
   ========================================================================= */
function EquipmentTable({
  items,
  onChange,
  makeNew,
}: {
  items: Equipment[];
  onChange: (v: Equipment[]) => void;
  makeNew: () => Equipment;
}) {
  const update = (id: string, patch: Partial<Equipment>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, makeNew()]);

  return (
    <Card
      title="Equipment List"
      subtitle="Biên bản kiểm tra"
      action={
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[40px_120px_140px_140px_140px_44px] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Cell>#</Cell>
            <Cell>Type</Cell>
            <Cell>Maker</Cell>
            <Cell>Model</Cell>
            <Cell>Serial</Cell>
            <Cell />
          </div>
          <AnimatePresence initial={false}>
            {items.map((eq, i) => (
              <motion.div
                key={eq.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="grid grid-cols-[40px_120px_140px_140px_140px_44px] border-b border-slate-100 last:border-0"
              >
                <Cell muted>{i + 1}</Cell>
                <GridInput
                  value={eq.type}
                  onChange={(v) => update(eq.id, { type: v })}
                />
                <GridInput
                  value={eq.maker}
                  onChange={(v) => update(eq.id, { maker: v })}
                />
                <GridInput
                  value={eq.model}
                  onChange={(v) => update(eq.id, { model: v })}
                />
                <GridInput
                  value={eq.serial}
                  onChange={(v) => update(eq.id, { serial: v })}
                />
                <button
                  onClick={() => remove(eq.id)}
                  className="flex items-center justify-center text-slate-400 hover:text-red-600"
                  aria-label="Delete row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-slate-500">
              No equipment yet — tap "Add row".
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   Service grid
   ========================================================================= */
function ServiceTable({
  items,
  onChange,
  makeNew,
}: {
  items: ServiceItem[];
  onChange: (v: ServiceItem[]) => void;
  makeNew: () => ServiceItem;
}) {
  const update = (id: string, patch: Partial<ServiceItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const add = () => onChange([...items, makeNew()]);

  return (
    <Card
      title="Service List"
      subtitle="Biên bản nghiệm thu"
      action={
        <button
          onClick={add}
          className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[40px_1fr_70px_70px_44px] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Cell>#</Cell>
            <Cell>Description</Cell>
            <Cell>Qty</Cell>
            <Cell>Unit</Cell>
            <Cell />
          </div>
          <AnimatePresence initial={false}>
            {items.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="grid grid-cols-[40px_1fr_70px_70px_44px] border-b border-slate-100 last:border-0"
              >
                <Cell muted>{i + 1}</Cell>
                <GridInput
                  value={s.description}
                  onChange={(v) => update(s.id, { description: v })}
                />
                <GridInput
                  value={s.quantity}
                  onChange={(v) => update(s.id, { quantity: v })}
                />
                <GridInput
                  value={s.unit}
                  onChange={(v) => update(s.id, { unit: v })}
                />
                <button
                  onClick={() => remove(s.id)}
                  className="flex items-center justify-center text-slate-400 hover:text-red-600"
                  aria-label="Delete row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-slate-500">
              No services yet — tap "Add row".
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   Export panel
   ========================================================================= */
function ExportPanel({
  exporting,
  onExport,
  customer,
  equipmentCount,
  serviceCount,
}: {
  exporting: "kt" | "nt" | null;
  onExport: (which: "kt" | "nt") => void;
  customer: CustomerInfo;
  equipmentCount: number;
  serviceCount: number;
}) {
  return (
    <Card title="Export PDF" subtitle="Generate signed inspection documents">
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
        <Summary label="Vessel" value={customer.vessel} />
        <Summary label="Job No." value={customer.jobNumber} />
        <Summary label="Equipment" value={`${equipmentCount} item${equipmentCount === 1 ? "" : "s"}`} />
        <Summary label="Services" value={`${serviceCount} item${serviceCount === 1 ? "" : "s"}`} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ExportButton
          loading={exporting === "kt"}
          onClick={() => onExport("kt")}
          title="In Biên Bản Kiểm Tra"
          subtitle="Inspection record · equipment list"
        />
        <ExportButton
          loading={exporting === "nt"}
          onClick={() => onExport("nt")}
          title="In Biên Bản Nghiệm Thu"
          subtitle="Service acceptance · works performed"
        />
      </div>

      <p className="text-xs text-slate-500">
        Templates are loaded from <code className="rounded bg-slate-100 px-1">/templates/</code>.
        If a template is missing, a blank A4 fallback is used so you can validate the data flow.
      </p>
    </Card>
  );
}

function ExportButton({
  loading,
  onClick,
  title,
  subtitle,
}: {
  loading: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading}
      className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow disabled:opacity-60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
          />
        ) : (
          <FileText className="h-5 w-5" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <FileDown className="mt-1 h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
    </motion.button>
  );
}

/* =========================================================================
   Tiny presentational primitives
   ========================================================================= */
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-lg font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";

function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Cell({ children, muted }: { children?: React.ReactNode; muted?: boolean }) {
  return (
    <div
      className={`flex items-center border-r border-slate-200 px-3 py-2.5 text-sm last:border-r-0 ${
        muted ? "text-slate-400" : ""
      }`}
    >
      {children}
    </div>
  );
}

function GridInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-r border-slate-200 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none focus:bg-slate-50 last:border-r-0"
    />
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="truncate text-sm font-medium text-slate-900" title={value}>
        {value}
      </div>
    </div>
  );
}

// Keep import used in case future enhancements reference CheckCircle2.
export const _icon = CheckCircle2;
