"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import NavbarSidebar from "@/layout/NavbarSidebar";
import ProtectedRoute from "@/routes/ProtectedRoute";
import {
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Eraser,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useResult } from "@/hooks/UserResult";
import { Result, Reconciliation, ReconcileStatus, FrontEndFile, BackEndFile, ReconcliledBy } from "@/types/Result";
import { toast } from "react-toastify";

// ---------- Helpers ----------

// "1,000,000" -> 1000000, "-" -> 0
const parseNumber = (val: any): number => {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const num = Number(String(val).replace(/,/g, "").trim());
  return isNaN(num) ? 0 : num;
};

// ປັບຊື່ header ໃຫ້ເປັນມາດຕະຖານ: ລົບ \n / ຊ່ອງວ່າງຊ້ຳ / ຕົວພິມໃຫຍ່
const normKey = (s: any) => String(s ?? "").replace(/\s+/g, " ").trim().toLowerCase();

const str = (v: any) => String(v ?? "").trim();

// CSV parser ທີ່ຮອງຮັບ "..." (ມີ comma ຢູ່ໃນຄ່າ), BOM, CRLF
const parseCSVText = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((x) => x.trim() !== "")) rows.push(row);
  }
  return rows;
};

// ແປງ array of rows -> array of object (key = normalized header)
const rowsToObjects = (rows: any[][], headerIdx: number): Record<string, any>[] => {
  const headers = rows[headerIdx].map(normKey);
  const out: Record<string, any>[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((x) => str(x) === "")) continue;
    const obj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = r[idx] ?? "";
    });
    out.push(obj);
  }
  return out;
};

// ---------- Mappers ----------

const mapFrontend = (r: Record<string, any>): FrontEndFile => ({
  cardType: str(r["card type"]),
  transactionDateTime: str(r["transaction date / time"]),
  merchantId: str(r["merchant id"]),
  merchantName: str(r["merchant name"]),
  Shift: str(r["shift"]),
  terminalId: str(r["terminal id"]),
  cardNumber: str(r["card number"]),
  vehicleLicense: str(r["vehicle license"]),
  product: str(r["product"]),
  priceLiter: parseNumber(r["price/liter"]),
  numberOfLiters: parseNumber(r["number of liters"]),
  total: parseNumber(r["total"]),
  status: str(r["status"]),
  approveCode: str(r["approve code"]),
  referenceNumber: str(r["reference number"]),
});

const mapBackend = (r: Record<string, any>): BackEndFile => ({
  no: parseNumber(r["no."]),
  system: str(r["system"]),
  cardType: str(r["card type"]),
  cardGrade: str(r["card grade"]),
  cutOfDate: str(r["cut off date"]),
  transactionDateTime: str(r["trans. date/time"]),
  setteldDateTime: str(r["settled date/time"]),
  merchant: str(r["merchant #"]),
  merchantName: str(r["merchant name"]),
  terminal: str(r["terminal #"]),
  customer: str(r["customer #"]),
  customerEngName: str(r["customer name(eng)"]),
  customerLaoName: str(r["customer name(lao)"]),
  seq: parseNumber(r["seq."]),
  card: str(r["card #"]),
  vehicalLicense: str(r["vehical licence"]),
  product: str(r["product"]),
  productType: str(r["product type"]),
  priceLiter: parseNumber(r["price/liter"]),
  numberOfLiters: parseNumber(r["number of liters"]),
  amount: parseNumber(r["amount(kip)"]),
  transactionStatus: str(r["trans. status"]).toUpperCase(),
  previousOdo: str(r["previous odo."]),
  odoMeter: str(r["odometer"]),
  distance: str(r["distance"]),
  consumption: str(r["consumption"]),
  invoice: str(r["invoice/trace#"]),
  reference: str(r["reference #"]),
  approveCode: str(r["approve code"]),
  endpoint: str(r["terminal batch#"]),
  responseCode: str(r["response code"]),
  errorCode: str(r["error code"]),
});

// ---------- Parsers ----------

const parseFrontendCSV = (file: File): Promise<FrontEndFile[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSVText(e.target?.result as string);
        if (rows.length === 0) return resolve([]);
        resolve(rowsToObjects(rows, 0).map(mapFrontend));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });

const parseBackendExcel = (file: File): Promise<BackEndFile[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // raw:false -> ເອົາຄ່າເປັນ text ຕາມທີ່ສະແດງ (ກັນ 0 ນຳໜ້າຂອງ Reference/Approve Code ຫາຍ)
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, {
          header: 1,
          raw: false,
          defval: "",
        });

        // ໄຟລ໌ມີແຖວຫົວຂໍ້ກ່ອນ header -> ຊອກແຖວ header ທີ່ແທ້ຈິງ
        const headerIdx = rows.findIndex((r) => {
          const keys = r.map(normKey);
          return keys.includes("reference #") && keys.includes("approve code");
        });
        if (headerIdx === -1) {
          throw new Error("ບໍ່ພົບແຖວ header (Reference # / Approve Code) ໃນໄຟລ໌ Backend");
        }

        resolve(rowsToObjects(rows, headerIdx).map(mapBackend));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

// ---------- Reconcile core ----------

const reconcile = (
  frontendRows: FrontEndFile[],
  backendAll: BackEndFile[]
): Omit<Reconciliation, "reconcileCode">[] => {
  // Backend: ນັບສະເພາະ APPROVED
  const backendRows = backendAll.filter((b) => b.transactionStatus === "APPROVED");

  const frontendUsed = new Array(frontendRows.length).fill(false);
  const backendPair: (number | null)[] = new Array(backendRows.length).fill(null);

  // Pass 1: ຈັບຄູ່ດ້ວຍ Reference Number
  backendRows.forEach((b, bi) => {
    if (!b.reference) return;
    const fi = frontendRows.findIndex(
      (f, idx) => !frontendUsed[idx] && f.referenceNumber === b.reference
    );
    if (fi !== -1) {
      frontendUsed[fi] = true;
      backendPair[bi] = fi;
    }
  });

  // Pass 2: ລາຍການທີ່ເຫຼືອ ລອງຈັບຄູ່ດ້ວຍ Approve Code
  backendRows.forEach((b, bi) => {
    if (backendPair[bi] !== null || !b.approveCode) return;
    const fi = frontendRows.findIndex(
      (f, idx) => !frontendUsed[idx] && f.approveCode === b.approveCode
    );
    if (fi !== -1) {
      frontendUsed[fi] = true;
      backendPair[bi] = fi;
    }
  });

  const items: Omit<Reconciliation, "reconcileCode">[] = [];

  // ລາຍການຂອງ Backend (ມີຄູ່ ຫຼື ONLY_IN_BACKEND)
  backendRows.forEach((b, bi) => {
    const fi = backendPair[bi];
    if (fi === null) {
      items.push({ frontend: null, backend: b, status: "ONLY_IN_BACKEND" });
      return;
    }
    const f = frontendRows[fi];
    const refOk = f.referenceNumber === b.reference;
    const approveOk = f.approveCode === b.approveCode;
    const amountOk = f.total === b.amount;

    let status: ReconcileStatus;
    if (refOk && approveOk && amountOk) status = "MATCHED";
    else if (refOk && approveOk && !amountOk) status = "AMOUNT_MISMATCH";
    else status = "PARTIAL_MATCH"; // Reference ຫຼື Approve Code ບໍ່ກົງ

    items.push({ frontend: f, backend: b, status });
  });

  // Frontend ທີ່ບໍ່ມີຄູ່ -> ONLY_IN_FRONTEND
  frontendRows.forEach((f, fi) => {
    if (!frontendUsed[fi]) {
      items.push({ frontend: f, backend: null, status: "ONLY_IN_FRONTEND" });
    }
  });

  return items;
};

// ຂໍ້ຄວາມບອກວ່າໂຕໃດບໍ່ກົງ
const getRemark = (item: Pick<Reconciliation, "frontend" | "backend" | "status">): string => {
  const { frontend: f, backend: b, status } = item;
  if (status === "ONLY_IN_FRONTEND") return "ມີສະເພາະ Frontend (ບໍ່ພົບໃນ Backend Approved)";
  if (status === "ONLY_IN_BACKEND") return "ມີສະເພາະ Backend (ບໍ່ພົບໃນ Frontend)";
  if (!f || !b || status === "MATCHED") return "";

  const diffs: string[] = [];
  if (f.referenceNumber !== b.reference) diffs.push("Reference");
  if (f.approveCode !== b.approveCode) diffs.push("Approve Code");
  if (f.total !== b.amount) diffs.push("ຍອດເງິນ");
  return diffs.length ? `${diffs.join(", ")} ບໍ່ກົງ` : "";
};

const STATUS_STYLE: Record<string, string> = {
  MATCHED: "bg-emerald-100 text-emerald-800",
  AMOUNT_MISMATCH: "bg-amber-100 text-amber-800",
  PARTIAL_MATCH: "bg-orange-100 text-orange-800",
  ONLY_IN_FRONTEND: "bg-sky-100 text-sky-800",
  ONLY_IN_BACKEND: "bg-rose-100 text-rose-800",
};

const ALL_STATUSES: ReconcileStatus[] = [
  "MATCHED",
  "AMOUNT_MISMATCH",
  "PARTIAL_MATCH",
  "ONLY_IN_FRONTEND",
  "ONLY_IN_BACKEND",
];

// ---------- Print (A4) ----------

// CSS ສຳລັບພິມ: A4 ແນວນອນ, ເຊື່ອງທຸກຢ່າງຍົກເວັ້ນ #print-root
const PRINT_CSS = `
#print-root { display: none; }

@media print {
  @page { size: A4 landscape; margin: 10mm; }

  html, body {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* ເຊື່ອງທຸກ element ໃນ body ຍົກເວັ້ນ print-root */
  body > *:not(#print-root) { display: none !important; }

  #print-root {
    display: block !important;
    width: 100%;
    color: #0f172a;
    font-size: 9px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #print-root .pr-title { font-size: 15px; font-weight: 700; margin: 0 0 2px; }
  #print-root .pr-meta { font-size: 9px; color: #475569; margin: 0 0 6px; }
  #print-root .pr-summary { display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 8px; }
  #print-root .pr-badge {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 600;
  }

  #print-root table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  #print-root thead { display: table-header-group; } /* ຫົວຕາຕະລາງຊ້ຳທຸກໜ້າ */
  #print-root tfoot { display: table-row-group; }
  #print-root tr { page-break-inside: avoid; break-inside: avoid; }
  #print-root th, #print-root td {
    border: 0.5px solid #cbd5e1;
    padding: 3px 4px;
    vertical-align: top;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  #print-root th { background: #e2e8f0 !important; font-weight: 700; }
  #print-root .pr-mono { font-family: ui-monospace, Menlo, Consolas, monospace; }
  #print-root .pr-right { text-align: right; }
  #print-root .pr-center { text-align: center; }
  #print-root .pr-total td { font-weight: 700; background: #f1f5f9 !important; }
}
`;

const fmt = (n: number) => n.toLocaleString();

// ---------- Page ----------

export default function CreateReconciliationPage() {
  const router = useRouter();
  const { createResult } = useResult();

  const [manageBy, setManageBy] = useState<ReconcliledBy | null>(null);
  const [frontendFile, setFrontendFile] = useState<File | null>(null);
  const [backendFile, setBackendFile] = useState<File | null>(null);

  const [previewItems, setPreviewItems] = useState<Reconciliation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputKey, setInputKey] = useState(0); // ໃຊ້ reset <input type="file"> ໃຫ້ເລືອກຟາຍເກົ່າຊ້ຳໄດ້
  const [mounted, setMounted] = useState(false); // ໃຊ້ກັບ createPortal (ກັນ SSR error)

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setManageBy({
          id: parsedUser.id,
          name: parsedUser.name,
          lastname: parsedUser.lastname || "",
          gender: parsedUser.gender || "MALE",
          contact: parsedUser.contact || "",
          email: parsedUser.email || "",
        });
      } else {
        toast.warning("ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ໃນລະບົບ ກະລຸນາເຂົ້າສູ່ລະບົບໃຫມ່");
      }
    } catch (error) {
      console.error("Error reading userInfo from localStorage:", error);
    }
  }, []);

  const handleProcessReconciliation = async () => {
    if (!frontendFile || !backendFile) {
      toast.error("ກະລຸນາອັບໂຫລດທັງ 2 ຟາຍ (Frontend ແລະ Backend)");
      return;
    }

    setIsProcessing(true);
    try {
      const frontendRows = await parseFrontendCSV(frontendFile);
      const backendRows = await parseBackendExcel(backendFile);

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const timestampPrefix =
        `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
        `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

      const reconciledItems: Reconciliation[] = reconcile(frontendRows, backendRows).map(
        (item, idx) => ({
          ...item,
          reconcileCode: `REC-${timestampPrefix}-${String(idx + 1).padStart(3, "0")}`,
        })
      );

      setPreviewItems(reconciledItems);
      toast.success(`ປະມວນຜົນທຽບຍອດສຳເລັດ (${reconciledItems.length} ລາຍການ)`);
    } catch (error) {
      console.error("Reconciliation Error:", error);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອ່ານຟາຍ");
    } finally {
      setIsProcessing(false);
    }
  };

  // ເຄລຍຟາຍ ແລະ ຜົນລັບທັງໝົດ
  const handleClear = () => {
    setFrontendFile(null);
    setBackendFile(null);
    setPreviewItems([]);
    setInputKey((k) => k + 1);
  };

  const handleSubmitSave = async () => {
    if (!manageBy) {
      toast.error("ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ (manageBy)");
      return;
    }
    if (previewItems.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນລາຍການທີ່ຈະບັນທຶກ");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Result = {
        manageBy,
        items: previewItems,
        createdAt: new Date().toISOString(),
      };
      await createResult(payload);
      handleClear(); // ສຳເລັດ -> ເຄລຍຟອມ ແລະຢູ່ໜ້າເດີມ (ບໍ່ redirect)
    } catch (error) {
      console.error("Save Error:", error);
      // ຖ້າຜິດພາດ ບໍ່ເຄລຍ ເພື່ອໃຫ້ກົດບັນທຶກໃໝ່ໄດ້
    } finally {
      setIsSubmitting(false);
    }
  };

  // ພິມ / ບັນທຶກເປັນ PDF (A4)
  const handlePrintPDF = () => {
    if (previewItems.length === 0) {
      toast.warning("ບໍ່ມີຂໍ້ມູນທີ່ຈະພິມ");
      return;
    }

    // ຕັ້ງຊື່ title ຊົ່ວຄາວ -> ເປັນຊື່ໄຟລ໌ PDF ຕອນ Save as PDF
    const originalTitle = document.title;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    document.title = `Reconciliation_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
      d.getDate()
    )}_${pad(d.getHours())}${pad(d.getMinutes())}`;

    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);

    // ໃຫ້ React render ໃຫ້ແລ້ວກ່ອນຄ່ອຍພິມ
    setTimeout(() => window.print(), 100);
  };

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_STATUSES.forEach((s) => (counts[s] = 0));
    previewItems.forEach((i) => (counts[i.status] += 1));
    return counts;
  }, [previewItems]);

  const totals = useMemo(() => {
    let fe = 0;
    let be = 0;
    previewItems.forEach((i) => {
      fe += i.frontend?.total ?? 0;
      be += i.backend?.amount ?? 0;
    });
    return { fe, be };
  }, [previewItems]);

  return (
    <ProtectedRoute>
      <NavbarSidebar>
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  ສ້າງລາຍການກວດສອບຍອດໃໝ່ (New Reconciliation)
                </h1>
                <p className="text-sm text-slate-500">
                  ອັບໂຫລດຟາຍ Frontend ແລະ Backend ເພື່ອທຽບຍອດອັດຕະໂນມັດ
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">1. ຟາຍ Frontend (CSV)</label>
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-6 text-center transition-colors bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                <input
                  key={`fe-${inputKey}`}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files && setFrontendFile(e.target.files[0])}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-indigo-600 mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {frontendFile ? frontendFile.name : "ຄລິກເພື່ອເລືອກຟາຍ CSV"}
                </p>
                <span className="text-xs text-slate-400 mt-1">Front-end System Transaction.csv</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">2. ຟາຍ Backend (Excel / XLS)</label>
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-6 text-center transition-colors bg-slate-50 flex flex-col items-center justify-center cursor-pointer">
                <input
                  key={`be-${inputKey}`}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={(e) => e.target.files && setBackendFile(e.target.files[0])}
                  className="hidden"
                />
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {backendFile ? backendFile.name : "ຄລິກເພື່ອເລືອກຟາຍ Excel"}
                </p>
                <span className="text-xs text-slate-400 mt-1">Back-end System Transaction.xls</span>
              </label>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleProcessReconciliation}
              disabled={isProcessing || !frontendFile || !backendFile}
              className="flex items-center gap-2 bg-indigo-900 hover:bg-indigo-800 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ກຳລັງປະມວນຜົນ Reconcile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ປະມວນຜົນທຽບຍອດ (Process Reconciliation)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={
                isProcessing ||
                isSubmitting ||
                (!frontendFile && !backendFile && previewItems.length === 0)
              }
              className="flex items-center gap-2 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 border border-slate-300 px-6 py-3 rounded-xl font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Eraser className="w-5 h-5" />
              <span>ເຄລຍ</span>
            </button>
          </div>

          {previewItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap gap-3 justify-between items-center border-b pb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  ຜົນການປະມວນຜົນ ({previewItems.length} ລາຍການ)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-white hover:bg-slate-100 disabled:opacity-60 text-indigo-900 border border-indigo-200 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>ພິມເປັນ PDF (A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitSave}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>ບັນທຶກລົງລະບົບ</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => (
                  <span
                    key={s}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[s]}`}
                  >
                    {s}: {summary[s]}
                  </span>
                ))}
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-3">ລະຫັດ Reconcile</th>
                      <th className="p-3">Approve Code (FE / BE)</th>
                      <th className="p-3">Reference (FE / BE)</th>
                      <th className="p-3 text-right">Frontend Total</th>
                      <th className="p-3 text-right">Backend Amount</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">ໝາຍເຫດ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewItems.map((item, idx) => {
                      const remark = getRemark(item);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-medium text-indigo-900">
                            {item.reconcileCode}
                          </td>
                          <td className="p-3 font-mono text-slate-900">
                            {item.frontend?.approveCode || "-"} / {item.backend?.approveCode || "-"}
                          </td>
                          <td className="p-3 font-mono text-slate-900">
                            {item.frontend?.referenceNumber || "-"} / {item.backend?.reference || "-"}
                          </td>
                          <td className="p-3 text-right text-slate-900">
                            {item.frontend ? `${item.frontend.total.toLocaleString()} ກີບ` : "-"}
                          </td>
                          <td className="p-3 text-right text-slate-900">
                            {item.backend ? `${item.backend.amount.toLocaleString()} ກີບ` : "-"}
                          </td>
                          <td className="p-3 text-center text-slate-900">
                            <span
                              className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${
                                STATUS_STYLE[item.status] || "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-rose-600">{remark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </NavbarSidebar>

      {/* ===== ເນື້ອໃນສຳລັບພິມ A4 (render ໃສ່ body ໂດຍກົງ, ສະແດງສະເພາະຕອນພິມ) ===== */}
      {mounted &&
        previewItems.length > 0 &&
        createPortal(
          <div id="print-root">
            <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

            <h1 className="pr-title">ລາຍງານການກວດສອບຍອດ (Reconciliation Report)</h1>
            <p className="pr-meta">
              ວັນທີພິມ: {new Date().toLocaleString()}
              {manageBy ? ` | ຜູ້ດຳເນີນການ: ${manageBy.name} ${manageBy.lastname}` : ""}
              {` | ທັງໝົດ ${previewItems.length} ລາຍການ`}
            </p>

            <div className="pr-summary">
              {ALL_STATUSES.map((s) => (
                <span key={s} className={`pr-badge ${STATUS_STYLE[s]}`}>
                  {s}: {summary[s]}
                </span>
              ))}
            </div>

            <table>
              <colgroup>
                <col style={{ width: "4%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="pr-center">#</th>
                  <th>ລະຫັດ Reconcile</th>
                  <th>Approve Code (FE / BE)</th>
                  <th>Reference (FE / BE)</th>
                  <th className="pr-right">Frontend Total</th>
                  <th className="pr-right">Backend Amount</th>
                  <th className="pr-center">Status</th>
                  <th>ໝາຍເຫດ</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="pr-center">{idx + 1}</td>
                    <td className="pr-mono">{item.reconcileCode}</td>
                    <td className="pr-mono">
                      {item.frontend?.approveCode || "-"} / {item.backend?.approveCode || "-"}
                    </td>
                    <td className="pr-mono">
                      {item.frontend?.referenceNumber || "-"} / {item.backend?.reference || "-"}
                    </td>
                    <td className="pr-right">
                      {item.frontend ? fmt(item.frontend.total) : "-"}
                    </td>
                    <td className="pr-right">
                      {item.backend ? fmt(item.backend.amount) : "-"}
                    </td>
                    <td className="pr-center">
                      <span className={`pr-badge ${STATUS_STYLE[item.status] || ""}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ color: "#e11d48" }}>{getRemark(item)}</td>
                  </tr>
                ))}
                <tr className="pr-total">
                  <td colSpan={4} className="pr-right">
                    ລວມທັງໝົດ (ກີບ)
                  </td>
                  <td className="pr-right">{fmt(totals.fe)}</td>
                  <td className="pr-right">{fmt(totals.be)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>,
          document.body
        )}
    </ProtectedRoute>
  );
}