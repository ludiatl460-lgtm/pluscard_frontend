"use client";

import React, { useState, useMemo } from "react";
import NavbarSidebar from "@/layout/NavbarSidebar";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { ResultColumn } from "@/components/table/TableHeaderList";
import TableComponent from "@/components/table/Table";
import { useResult } from "@/hooks/UserResult";
import { Loader2, AlertCircle, Eye, Search, Calendar } from "lucide-react";
import { Result } from "@/types/Result";
import ReconciliationDetailModal from "@/components/form/ReconciliationDetailForm";

export default function Reconciliation() {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { results, loading, error } = useResult();
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const handleViewDetail = (result: Result) => {
    setSelectedResult(result);
    setIsDetailModalOpen(true);
  };
  const filteredResults = useMemo(() => {
    if (!results) return [];

    // 1. ຈັດລຳດັບ (Sort) ຕາມ createdAt ຈາກໃໝ່ໄປເກົ່າ (ປ้องกัน undefined)
    const sortedResults = [...results].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA; // ໃຫມ່ສຸດຢູ່ເທິງ
    });

    // 2. ກັ່ນຕອງ (Filter) ຕາມການຄົ້ນຫາ ແລະ ຊ່ວງວັນທີ
    return sortedResults.filter((result) => {
      const id = (result.id || "").toLowerCase();
      const createdAtStr = result.createdAt ? new Date(result.createdAt).toLocaleString("lo-LA").toLowerCase() : "";
      const name = (result.manageBy?.name || "").toLowerCase();
      const lastname = (result.manageBy?.lastname || "").toLowerCase();
      const fullName = `${name} ${lastname}`;
      const genderText = (result.manageBy?.gender === "MALE" ? "ຊາຍ" : "ຍິງ").toLowerCase();
      const contact = (result.manageBy?.contact || "").toLowerCase();
      const email = (result.manageBy?.email || "").toLowerCase();

      const query = searchTerm.toLowerCase().trim();

      const matchesSearch = 
        id.includes(query) ||
        createdAtStr.includes(query) ||
        fullName.includes(query) ||
        genderText.includes(query) ||
        contact.includes(query) ||
        email.includes(query);

      // ກັ່ນຕອງຕາມຊ່ວງວັນທີ (From Date - To Date)
      let matchesDate = true;
      if (result.createdAt) {
        const resultDate = new Date(result.createdAt);
        const rYear = resultDate.getFullYear();
        const rMonth = String(resultDate.getMonth() + 1).padStart(2, '0');
        const rDay = String(resultDate.getDate()).padStart(2, '0');
        const resultDateOnly = `${rYear}-${rMonth}-${rDay}`;

        if (fromDate && resultDateOnly < fromDate) {
          matchesDate = false;
        }
        if (toDate && resultDateOnly > toDate) {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [results, searchTerm, fromDate, toDate]);
  return (
    <ProtectedRoute>
      <NavbarSidebar>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ລາຍງານການທຽບຍອດ (Reconciliation Report)</h1>
              <p className="text-sm text-slate-500">ປະຫວັດ ແລະ ຜົນການຈັບຄູ່ຂໍ້ມູນທັງໝົດໃນລະບົບ</p>
            </div>
          </div>

          {/* Search & Date Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              
              {/* ຊ່ອງຄົ້ນຫາທົ່ວໄປ */}
              <div className="relative w-full sm:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ຄົ້ນຫາທຸກຂໍ້ມູນ (ລະຫັດ, ຊື່, ເບີໂທ, ອີເມວ...)"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* ຊ່ວງວັນທີ From - To */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <span className="text-slate-400 text-sm hidden sm:inline">ຫາ</span>

                <div className="relative w-full sm:w-auto">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">ເກີດຂໍ້ຜິດພາດ: </span>
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-900 animate-spin" />
              <p className="text-sm font-medium text-slate-500">ກຳລັງໂຫລດຂໍ້ມູນ Result...</p>
            </div>
          ) : (
            <TableComponent columns={ResultColumn} data={filteredResults}>
              {(result, index, globalIndex) => (
                <tr key={result.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="py-3 px-4 text-center font-medium text-slate-500 text-xs">
                    {globalIndex + 1}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700 text-xs">
                    {result?.id?.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-sm">
                    {new Date(result.createdAt).toLocaleString("lo-LA", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3 px-4 font-medium text-indigo-900 text-sm">
                    {result.manageBy?.name} {result.manageBy?.lastname || ""}
                  </td>
                  <td className="py-3 px-4">
                    {result.manageBy?.gender === "MALE" ? (
                      <span className="px-2 py-1 rounded-md border-indigo-900 bg-indigo-200 text-indigo-800 text-xs font-semibold">
                        ຊາຍ
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md border-pink-900 bg-pink-200 text-pink-800 text-xs font-semibold">
                        ຍິງ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-sm">
                    {result.manageBy?.contact}
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-sm">
                    {result.manageBy?.email || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(result)}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        title="ເບິ່ງລາຍລະອຽດ Items"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </TableComponent>
          )}

          <ReconciliationDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            data={selectedResult}
          />
        </div>
      </NavbarSidebar>
    </ProtectedRoute>
  );
}