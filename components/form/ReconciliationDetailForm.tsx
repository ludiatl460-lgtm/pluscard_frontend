"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, UserCheck, Layers, CheckCircle2, AlertTriangle, Filter, Printer } from "lucide-react";
import { Result } from "@/types/Result";

interface ReconciliationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Result | null;
}

type Item = Result["items"][number];

// ---------- Print config ----------

const STATUS_STYLE: Record<string, string> = {
  MATCHED: "bg-emerald-100 text-emerald-800",
  AMOUNT_MISMATCH: "bg-amber-100 text-amber-800",
  PARTIAL_MATCH: "bg-orange-100 text-orange-800",
  ONLY_IN_FRONTEND: "bg-sky-100 text-sky-800",
  ONLY_IN_BACKEND: "bg-rose-100 text-rose-800",
};

const fmt = (n?: number) => (n === undefined || n === null ? "-" : n.toLocaleString());

// ຟີວຂອງ Frontend ສຳລັບພິມ
const FE_FIELDS: { label: string; get: (i: Item) => string }[] = [
  { label: "Card Type", get: (i) => i.frontend!.cardType },
  { label: "Transaction Date/Time", get: (i) => i.frontend!.transactionDateTime },
  { label: "Merchant ID", get: (i) => i.frontend!.merchantId },
  { label: "Merchant Name", get: (i) => i.frontend!.merchantName },
  { label: "Shift", get: (i) => i.frontend!.Shift },
  { label: "Terminal ID", get: (i) => i.frontend!.terminalId },
  { label: "Card Number", get: (i) => i.frontend!.cardNumber },
  { label: "Vehicle License", get: (i) => i.frontend!.vehicleLicense },
  { label: "Product", get: (i) => i.frontend!.product },
  { label: "Price / Liter", get: (i) => `${fmt(i.frontend!.priceLiter)} ກີບ` },
  { label: "Number Of Liters", get: (i) => `${i.frontend!.numberOfLiters} L` },
  { label: "Total Amount", get: (i) => `${fmt(i.frontend!.total)} ກີບ` },
  { label: "Status", get: (i) => i.frontend!.status },
  { label: "Approve Code", get: (i) => i.frontend!.approveCode },
  { label: "Reference Number", get: (i) => i.frontend!.referenceNumber },
];

// ຟີວຂອງ Backend ສຳລັບພິມ
const BE_FIELDS: { label: string; get: (i: Item) => string }[] = [
  { label: "No", get: (i) => String(i.backend!.no) },
  { label: "System", get: (i) => i.backend!.system },
  { label: "Card Type", get: (i) => i.backend!.cardType },
  { label: "Card Grade", get: (i) => i.backend!.cardGrade },
  { label: "Cut Of Date", get: (i) => i.backend!.cutOfDate },
  { label: "Transaction Date/Time", get: (i) => i.backend!.transactionDateTime },
  { label: "Settled Date/Time", get: (i) => i.backend!.setteldDateTime },
  { label: "Merchant", get: (i) => i.backend!.merchant },
  { label: "Merchant Name", get: (i) => i.backend!.merchantName },
  { label: "Terminal", get: (i) => i.backend!.terminal },
  { label: "Customer", get: (i) => i.backend!.customer },
  { label: "Customer Eng Name", get: (i) => i.backend!.customerEngName },
  { label: "Customer Lao Name", get: (i) => i.backend!.customerLaoName },
  { label: "Seq", get: (i) => String(i.backend!.seq) },
  { label: "Card", get: (i) => i.backend!.card },
  { label: "Vehicle License", get: (i) => i.backend!.vehicalLicense },
  { label: "Product", get: (i) => i.backend!.product },
  { label: "Product Type", get: (i) => i.backend!.productType },
  { label: "Price / Liter", get: (i) => `${fmt(i.backend!.priceLiter)} ກີບ` },
  { label: "Number Of Liters", get: (i) => `${i.backend!.numberOfLiters} L` },
  { label: "Amount", get: (i) => `${fmt(i.backend!.amount)} ກີບ` },
  { label: "Transaction Status", get: (i) => i.backend!.transactionStatus },
  { label: "Previous Odo", get: (i) => i.backend!.previousOdo },
  { label: "Odo Meter", get: (i) => i.backend!.odoMeter },
  { label: "Distance", get: (i) => i.backend!.distance },
  { label: "Consumption", get: (i) => i.backend!.consumption },
  { label: "Invoice", get: (i) => i.backend!.invoice },
  { label: "Reference", get: (i) => i.backend!.reference },
  { label: "Approve Code", get: (i) => i.backend!.approveCode },
  { label: "Endpoint", get: (i) => i.backend!.endpoint },
  { label: "Response Code", get: (i) => i.backend!.responseCode },
  { label: "Error Code", get: (i) => i.backend!.errorCode || "-" },
];

// CSS ສຳລັບພິມ: A4 ແນວຕັ້ງ, ເຊື່ອງທຸກຢ່າງຍົກເວັ້ນ #print-detail
const PRINT_CSS = `
#print-detail { display: none; }

@media print {
  @page { size: A4 portrait; margin: 10mm; }

  html, body {
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
    overflow: visible !important;
  }

  body > *:not(#print-detail) { display: none !important; }

  #print-detail {
    display: block !important;
    width: 100%;
    color: #0f172a;
    font-size: 8px;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #print-detail .pd-title { font-size: 15px; font-weight: 700; margin: 0 0 4px; }
  #print-detail .pd-sub { font-size: 9px; color: #475569; margin: 0 0 8px; }

  #print-detail .pd-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px 10px;
    border: 0.5px solid #c7d2fe;
    background: #eef2ff !important;
    border-radius: 4px;
    padding: 6px 8px;
    margin-bottom: 10px;
  }
  #print-detail .pd-info .k { color: #64748b; display: block; font-size: 7.5px; }
  #print-detail .pd-info .v { font-weight: 600; font-size: 9px; word-break: break-word; }

  #print-detail .pd-card {
    border: 0.5px solid #cbd5e1;
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  #print-detail .pd-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f5f9 !important;
    padding: 4px 8px;
    border-bottom: 0.5px solid #cbd5e1;
  }
  #print-detail .pd-code {
    background: #312e81 !important;
    color: #fff !important;
    font-family: ui-monospace, Menlo, Consolas, monospace;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 8px;
  }
  #print-detail .pd-badge {
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 7.5px;
    font-weight: 700;
  }

  #print-detail .pd-cols { display: grid; grid-template-columns: 1fr 1fr; }
  #print-detail .pd-col { padding: 5px 8px; min-width: 0; }
  #print-detail .pd-col + .pd-col { border-left: 0.5px solid #cbd5e1; }
  #print-detail .pd-col-title {
    font-weight: 700;
    font-size: 9px;
    border-bottom: 0.5px solid #cbd5e1;
    padding-bottom: 2px;
    margin-bottom: 3px;
    display: flex;
    justify-content: space-between;
  }
  #print-detail .pd-fe .pd-col-title { color: #312e81; }
  #print-detail .pd-be .pd-col-title { color: #064e3b; }
  #print-detail .pd-empty { color: #94a3b8; font-style: italic; }

  #print-detail .pd-row {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    border-bottom: 0.3px solid #e2e8f0;
    padding: 1px 0;
  }
  #print-detail .pd-row .l { color: #64748b; flex-shrink: 0; }
  #print-detail .pd-row .r { font-weight: 500; text-align: right; word-break: break-word; overflow-wrap: anywhere; }
  #print-detail .pd-row .r.strong { font-weight: 700; }
}
`;

export default function ReconciliationDetailModal({
  isOpen,
  onClose,
  data,
}: ReconciliationDetailModalProps) {
  // 1. ປະກາດ Hooks ທັງໝົດໄວ້ດ້ານເທິງສຸດ (ห้ามมี return ມາກັ້ນກ່ອນ)
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [mounted, setMounted] = useState(false); // ໃຊ້ກັບ createPortal (ກັນ SSR error)

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFilterStatus("ALL");
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (filterStatus === "ALL") return data.items;
    return data.items.filter((item) => item.status === filterStatus);
  }, [data?.items, filterStatus]);

  // ພິມ / ບັນທຶກເປັນ PDF (A4)
  const handlePrintPDF = () => {
    if (!data || filteredItems.length === 0) return;

    // ຕັ້ງ title ຊົ່ວຄາວ -> ເປັນຊື່ໄຟລ໌ PDF ຕອນ Save as PDF
    const originalTitle = document.title;
    document.title = `Reconciliation_${data.id ?? "detail"}`;

    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);

    // ໃຫ້ React render ໃຫ້ແລ້ວກ່ອນຄ່ອຍພິມ
    setTimeout(() => window.print(), 100);
  };

  // 2. ວາງ if (Return null) ໄວ້ຫຼັງ Hooks ທັງໝົດແລ້ວ ຮັບຮອງວ່າ Error ຈະຫາຍໄປ 100%!
  if (!isOpen || !data) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col border border-indigo-100">

          {/* Modal Header */}
          <div className="flex justify-between items-center bg-indigo-900 text-white px-6 py-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">ລາຍລະອຽດຜົນການກວດສອບຍອດ (Reconciliation Details)</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintPDF}
                disabled={filteredItems.length === 0}
                className="flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>ພິມເປັນ PDF (A4)</span>
              </button>
              <button
                onClick={onClose}
                className="text-indigo-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-indigo-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700">

            {/* ຂໍ້ມູນຜູ້ຈັດການ (ManageBy) */}
            <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-900 font-semibold border-b border-indigo-200 pb-2">
                <UserCheck className="w-4 h-4" />
                <h4>ຂໍ້ມູນຜູ້ສ້າງ / ຜູ້ຈັດການ</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">ຊື່ ແລະ ນາມສະກຸນ:</span>
                  <span className="font-medium text-slate-800">{data.manageBy.name} {data.manageBy.lastname || ""}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">ເພດ:</span>
                  <span className="font-medium text-slate-800">{data.manageBy.gender === "MALE" ? "ຊາຍ" : "ຍິງ"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">ເບີໂທລະສັບ:</span>
                  <span className="font-medium text-slate-800">{data.manageBy.contact}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">ອີເມວ:</span>
                  <span className="font-medium text-slate-800">{data.manageBy.email || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">ວັນທີສ້າງ Result:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(data.createdAt).toLocaleString("lo-LA")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Result ID:</span>
                  <span className="font-medium text-slate-800 font-mono text-xs">{data.id}</span>
                </div>
              </div>
            </div>

            {/* ລາຍການ Items ທັງໝົດ ພ້ອມ Toolbar Filter ສະຖານະ */}
            <div className="space-y-4">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h4>ລາຍການທຸລະກຳ ({filteredItems.length} / {data.items.length} ລາຍການ)</h4>
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Filter className="w-4 h-4" />
                  </span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">ສະຖານະທັງໝົດ (All Status)</option>
                    <option value="MATCHED">Matched (ກົງກັນ)</option>
                    <option value="AMOUNT_MISMATCH">Amount Mismatch (ຈຳນວນເງິນບໍ່ກົງ)</option>
                    <option value="PARTIAL_MATCH">Partial Match (ກົງບາງສ່ວນ)</option>
                    <option value="ONLY_IN_FRONTEND">Only in Frontend (ມີແຕ່ໜ້າບ້ານ)</option>
                    <option value="ONLY_IN_BACKEND">Only in Backend (ມີແຕ່ຫຼັງບ້ານ)</option>
                  </select>
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                  ບໍ່ພົບລາຍການທຸລະກຳຕາມສະຖານະທີ່ເລືອກ
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                    <div className="bg-slate-100 px-4 py-3 flex flex-wrap justify-between items-center gap-2 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <span className="bg-indigo-900 text-white text-xs px-2.5 py-1 rounded-md font-mono">
                          {item.reconcileCode}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">ລໍາດັບທີ່: {index + 1}</span>
                      </div>
                      <div>
                        {item.status === "MATCHED" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> MATCHED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> {item.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">

                      {/* Frontend Data */}
                      <div className="p-4 space-y-2 bg-slate-50/50">
                        <h5 className="font-bold text-indigo-900 text-sm mb-3 border-b pb-1.5 flex items-center justify-between">
                          <span>Frontend File Data</span>
                          <span className="text-xs font-normal text-slate-500">({item.frontend ? "ມີຂໍ້ມູນ" : "ບໍ່ມີ"})</span>
                        </h5>
                        {item.frontend ? (
                          <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Card Type:</span> <span className="font-medium text-slate-800">{item.frontend.cardType}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Transaction Date/Time:</span> <span className="font-medium text-slate-800">{item.frontend.transactionDateTime}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Merchant ID:</span> <span className="font-medium text-slate-800">{item.frontend.merchantId}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Merchant Name:</span> <span className="font-medium text-slate-800">{item.frontend.merchantName}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Shift:</span> <span className="font-medium text-slate-800">{item.frontend.Shift}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Terminal ID:</span> <span className="font-medium text-slate-800">{item.frontend.terminalId}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Card Number:</span> <span className="font-medium text-slate-800">{item.frontend.cardNumber}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Vehicle License:</span> <span className="font-medium text-slate-800">{item.frontend.vehicleLicense}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Product:</span> <span className="font-medium text-slate-800">{item.frontend.product}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Price / Liter:</span> <span className="font-medium text-slate-800">{item.frontend.priceLiter?.toLocaleString()} ກີບ</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Number Of Liters:</span> <span className="font-medium text-slate-800">{item.frontend.numberOfLiters} L</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Total Amount:</span> <span className="font-semibold text-indigo-900">{item.frontend.total?.toLocaleString()} ກີບ</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Status:</span> <span className="font-medium text-slate-800">{item.frontend.status}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Approve Code:</span> <span className="font-medium text-slate-800">{item.frontend.approveCode}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Reference Number:</span> <span className="font-medium text-slate-800">{item.frontend.referenceNumber}</span></div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">ບໍ່ມີຂໍ້ມູນ Frontend</p>
                        )}
                      </div>

                      {/* Backend Data */}
                      <div className="p-4 space-y-2 bg-white">
                        <h5 className="font-bold text-emerald-900 text-sm mb-3 border-b pb-1.5 flex items-center justify-between">
                          <span>Backend File Data</span>
                          <span className="text-xs font-normal text-slate-500">({item.backend ? "ມີຂໍ້ມູນ" : "ບໍ່ມີ"})</span>
                        </h5>
                        {item.backend ? (
                          <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">No:</span> <span className="font-medium text-slate-800">{item.backend.no}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">System:</span> <span className="font-medium text-slate-800">{item.backend.system}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Card Type:</span> <span className="font-medium text-slate-800">{item.backend.cardType}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Card Grade:</span> <span className="font-medium text-slate-800">{item.backend.cardGrade}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Cut Of Date:</span> <span className="font-medium text-slate-800">{item.backend.cutOfDate}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Transaction Date/Time:</span> <span className="font-medium text-slate-800">{item.backend.transactionDateTime}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Settled Date/Time:</span> <span className="font-medium text-slate-800">{item.backend.setteldDateTime}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Merchant:</span> <span className="font-medium text-slate-800">{item.backend.merchant}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Merchant Name:</span> <span className="font-medium text-slate-800">{item.backend.merchantName}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Terminal:</span> <span className="font-medium text-slate-800">{item.backend.terminal}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Customer:</span> <span className="font-medium text-slate-800">{item.backend.customer}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Customer Eng Name:</span> <span className="font-medium text-slate-800">{item.backend.customerEngName}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Customer Lao Name:</span> <span className="font-medium text-slate-800">{item.backend.customerLaoName}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Seq:</span> <span className="font-medium text-slate-800">{item.backend.seq}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Card:</span> <span className="font-medium text-slate-800">{item.backend.card}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Vehicle License:</span> <span className="font-medium text-slate-800">{item.backend.vehicalLicense}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Product:</span> <span className="font-medium text-slate-800">{item.backend.product}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Product Type:</span> <span className="font-medium text-slate-800">{item.backend.productType}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Price / Liter:</span> <span className="font-medium text-slate-800">{item.backend.priceLiter?.toLocaleString()} ກີບ</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Number Of Liters:</span> <span className="font-medium text-slate-800">{item.backend.numberOfLiters} L</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Amount:</span> <span className="font-semibold text-emerald-900">{item.backend.amount?.toLocaleString()} ກີບ</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Transaction Status:</span> <span className="font-medium text-slate-800">{item.backend.transactionStatus}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Previous Odo:</span> <span className="font-medium text-slate-800">{item.backend.previousOdo}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Odo Meter:</span> <span className="font-medium text-slate-800">{item.backend.odoMeter}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Distance:</span> <span className="font-medium text-slate-800">{item.backend.distance}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Consumption:</span> <span className="font-medium text-slate-800">{item.backend.consumption}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Invoice:</span> <span className="font-medium text-slate-800">{item.backend.invoice}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Reference:</span> <span className="font-medium text-slate-800">{item.backend.reference}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Approve Code:</span> <span className="font-medium text-slate-800">{item.backend.approveCode}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Endpoint:</span> <span className="font-medium text-slate-800">{item.backend.endpoint}</span></div>
                            <div className="flex justify-between border-b border-slate-100 pb-1"><span className="text-slate-500">Response Code:</span> <span className="font-medium text-slate-800">{item.backend.responseCode}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Error Code:</span> <span className="font-medium text-slate-800">{item.backend.errorCode || "-"}</span></div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">ບໍ່ມີຂໍ້ມູນ Backend</p>
                        )}
                      </div>

                    </div>

                  </div>
                ))
              )}

            </div>

          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
            <button
              type="button"
              onClick={handlePrintPDF}
              disabled={filteredItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-900 bg-white border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              ພິມເປັນ PDF (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
            >
              ປິດ
            </button>
          </div>

        </div>
      </div>

      {/* ===== ເນື້ອໃນສຳລັບພິມ A4 (render ໃສ່ body ໂດຍກົງ, ສະແດງສະເພາະຕອນພິມ) ===== */}
      {mounted &&
        createPortal(
          <div id="print-detail">
            <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

            <h1 className="pd-title">ລາຍລະອຽດຜົນການກວດສອບຍອດ (Reconciliation Details)</h1>
            <p className="pd-sub">
              ວັນທີພິມ: {new Date().toLocaleString("lo-LA")}
              {` | ລາຍການທີ່ພິມ ${filteredItems.length} / ${data.items.length}`}
              {filterStatus !== "ALL" ? ` | Filter: ${filterStatus}` : ""}
            </p>

            {/* ຂໍ້ມູນຜູ້ສ້າງ */}
            <div className="pd-info">
              <div>
                <span className="k">ຊື່ ແລະ ນາມສະກຸນ</span>
                <span className="v">{data.manageBy.name} {data.manageBy.lastname || ""}</span>
              </div>
              <div>
                <span className="k">ເພດ</span>
                <span className="v">{data.manageBy.gender === "MALE" ? "ຊາຍ" : "ຍິງ"}</span>
              </div>
              <div>
                <span className="k">ເບີໂທລະສັບ</span>
                <span className="v">{data.manageBy.contact || "-"}</span>
              </div>
              <div>
                <span className="k">ອີເມວ</span>
                <span className="v">{data.manageBy.email || "-"}</span>
              </div>
              <div>
                <span className="k">ວັນທີສ້າງ Result</span>
                <span className="v">{new Date(data.createdAt).toLocaleString("lo-LA")}</span>
              </div>
              <div>
                <span className="k">Result ID</span>
                <span className="v">{data.id}</span>
              </div>
            </div>

            {/* ລາຍການທຸລະກຳ */}
            {filteredItems.map((item, index) => (
              <div key={index} className="pd-card">
                <div className="pd-card-head">
                  <div>
                    <span className="pd-code">{item.reconcileCode}</span>
                    <span style={{ marginLeft: 6, color: "#64748b" }}>ລໍາດັບທີ່: {index + 1}</span>
                  </div>
                  <span className={`pd-badge ${STATUS_STYLE[item.status] || ""}`}>{item.status}</span>
                </div>

                <div className="pd-cols">
                  <div className="pd-col pd-fe">
                    <div className="pd-col-title">
                      <span>Frontend File Data</span>
                      <span style={{ fontWeight: 400, color: "#64748b" }}>({item.frontend ? "ມີຂໍ້ມູນ" : "ບໍ່ມີ"})</span>
                    </div>
                    {item.frontend ? (
                      FE_FIELDS.map((f) => (
                        <div key={f.label} className="pd-row">
                          <span className="l">{f.label}:</span>
                          <span className={`r ${f.label === "Total Amount" ? "strong" : ""}`}>{f.get(item) || "-"}</span>
                        </div>
                      ))
                    ) : (
                      <p className="pd-empty">ບໍ່ມີຂໍ້ມູນ Frontend</p>
                    )}
                  </div>

                  <div className="pd-col pd-be">
                    <div className="pd-col-title">
                      <span>Backend File Data</span>
                      <span style={{ fontWeight: 400, color: "#64748b" }}>({item.backend ? "ມີຂໍ້ມູນ" : "ບໍ່ມີ"})</span>
                    </div>
                    {item.backend ? (
                      BE_FIELDS.map((f) => (
                        <div key={f.label} className="pd-row">
                          <span className="l">{f.label}:</span>
                          <span className={`r ${f.label === "Amount" ? "strong" : ""}`}>{f.get(item) || "-"}</span>
                        </div>
                      ))
                    ) : (
                      <p className="pd-empty">ບໍ່ມີຂໍ້ມູນ Backend</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}