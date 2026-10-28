"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/types/User";
import { Edit3, X } from "lucide-react";
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: User) => void;
  initialData: User | null; // ຂໍ້ມູນຜູ້ໃຊ້ທີ່ຕ້ອງການແກ້ໄຂ
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<User>({
    name: "",
    lastname: "",
    gender: "MALE",
    contact: "",
    email: "",
    username: "",
    password: "", // ປົກກະຕິຕອນແກ້ໄຂ ລະຫັດຜ່ານອາດຈະປ່ອຍຫວ່າງໄວ້ຖ້າບໍ່ຕ້ອງການປ່ຽນ
  });


  // ຖ້າມີ initialData ໃຫ້ເອົາມາใส่ใน state ຕອນເປີດ Modal
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: "", // ມັກຈະໃຫ້ຫວ່າງໄວ້ເພື່ອຄວາມປອດໄພ
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (!dataToSend.password || dataToSend.password.trim() === "") {
      delete dataToSend.password;
    }

    await onSubmit(dataToSend);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-indigo-100 transform transition-all">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-indigo-900 text-white px-6 py-4">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5" />
            <h3 className="text-lg font-semibold">ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້</h3>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-indigo-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-900">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ຊື່</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="ກະລຸນາປ້ອນຊື່"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ນາມສະກຸນ</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname || ""}
                onChange={handleChange}
                placeholder="ກະລຸນາປ້ອນນາມສະກຸນ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ເພດ</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="MALE">ຊາຍ</option>
                <option value="FEMALE">ຍິງ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ເບີໂທລະສັບ</label>
              <input
                type="text"
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
                placeholder="020xxxxxxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ອີເມວ</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ຊື່ຜູ້ໃຊ້ (Username)</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ລະຫັດຜ່ານໃໝ່ (ປ່ອຍຫວ່າງຖ້າບໍ່ປ່ຽນ)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
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
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-900 hover:bg-indigo-800 rounded-xl shadow-sm transition-colors"
            >
              ບັນທຶກການແກ້ໄຂ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}