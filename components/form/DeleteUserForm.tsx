"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string; 
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-rose-100 transform transition-all">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-rose-600 text-white px-6 py-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">ຢືນຢັນການລົບຂໍ້ມູນ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-rose-100 hover:text-white transition-colors p-1 rounded-lg hover:bg-rose-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 text-slate-700">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm">
              ທ່ານແນ່ໃຈບບໍ ທີ່ຈະຕ້ອງການລົບຜູ້ໃຊ້ງານ <span className="font-bold text-slate-900">"{userName}"</span> ນີ້ແມ່ນບໍ?
            </p>
            <p className="text-xs text-slate-500">
              ການກະຳລົງນີ້ ບໍ່ສາມາດກູ້ຄືນຂໍ້ມູນໄດ້ ແລະ ຈະຖືກລົບອອກຈາກລະບົບຢ່າງຖາວອນ.
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
            >
              ຕົກລົງ, ລົບຂໍ້ມູນ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}