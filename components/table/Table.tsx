"use client";

import React, { useState, ReactNode } from "react";

interface Column {
  key: string;
  label: string;
}

interface TableComponentProps<T> {
  columns: Column[];
  data: T[];
  itemsPerPage?: number;
  children: (item: T, index: number, globalIndex: number) => ReactNode;
}

export default function TableComponent<T>({
  columns,
  data,
  itemsPerPage = 7,
  children,
}: TableComponentProps<T>) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ຄຳນວນຂໍ້ມູນສຳລັບແບ່ງໜ້າ
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-indigo-100">
      {/* ຕາຕະລາງ */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-900 text-white text-sm uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold w-16 text-center">ລຳດັບ</th>
              {columns.map((col) => (
                <th key={col.key} className="py-3.5 px-4 font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50 text-slate-700 text-sm">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) =>
                children(item, index, indexOfFirstItem + index)
              )
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-8 text-center text-slate-400"
                >
                  ບໍ່ມີຂໍ້ມູນ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (ປຸ່ມປ່ຽນໜ້າ) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-indigo-100">
          <span className="text-sm text-slate-500">
            ສະແດງ <span className="font-medium text-indigo-900">{indexOfFirstItem + 1}</span> ເຖິງ{" "}
            <span className="font-medium text-indigo-900">
              {Math.min(indexOfLastItem, data.length)}
            </span>{" "}
            ຈາກທັງໝົດ <span className="font-medium text-indigo-900">{data.length}</span> ລາຍການ
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 text-sm font-medium rounded-lg border border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              ກ່ອນໜ້າ
            </button>
            
            <span className="text-sm font-medium text-slate-600 px-2">
              ໜ້າ {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 text-sm font-medium rounded-lg border border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              ໜ້າຖັດໄປ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}