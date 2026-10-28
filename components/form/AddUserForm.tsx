"use client";

import React, { useState } from "react";
import { User } from "@/types/User";
import { UserPlus, X } from "lucide-react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: User) => void;
}

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
}: UserModalProps) {
  const initialFormState: User = {
    name: "",
    lastname: "",
    gender: "MALE",
    contact: "",
    email: "",
    username: "",
    password: "",
  };

  const [formData, setFormData] = useState<User>(initialFormState);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-indigo-100 transform transition-all">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-indigo-900 text-white px-6 py-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-lg font-semibold">ເພີ່ມຜູ້ໃຊ້ໃໝ່</h3>
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
              <label className="block text-xs font-medium text-slate-600 mb-1">ລະຫັດຜ່ານ (Password)</label>
              <input
                type="password"
                name="password"
                required
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
              ບັນທຶກຂໍ້ມູນ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}