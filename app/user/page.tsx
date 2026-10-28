"use client";

import React, { useState } from "react";
import NavbarSidebar from "@/layout/NavbarSidebar";
import ProtectedRoute from "@/routes/ProtectedRoute";
import TableComponent from "@/components/table/Table";
import { Plus, Edit, Trash2, Search, Loader2, AlertCircle } from "lucide-react";
import { UserColumn } from "@/components/table/TableHeaderList";
import { useUser } from "@/hooks/UseUser";
import UserModal from "@/components/form/AddUserForm";
import EditUserModal from "@/components/form/EditUserForm";
import { User as UserType } from "@/types/User";
import DeleteConfirmModal from "@/components/form/DeleteUserForm";

export default function User() {
  const { error, loading, search, setSearch, users, creatUser, updateUser, deleteUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

  const handleAddSubmit = async (data: UserType) => {
    console.log("ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້ໃໝ່:", data);
    await creatUser(data);
  };
  const handleEditClick = async (user: UserType) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const handleEditSubmit = async (data: UserType) => {
    if (selectedUser?.id) {
      await updateUser(selectedUser.id, data);
    }
  };
  const handleDeleteClick = (user: UserType) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };


  const handleConfirmDelete = async () => {
    if (userToDelete?.id) {
      await deleteUser(userToDelete.id);
    }
  };
  return (
    <ProtectedRoute>
      <NavbarSidebar>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ຈັດການຜູ້ໃຊ້</h1>
              <p className="text-sm text-slate-500">ລາຍຊື່ຜູ້ໃຊ້ງານລະບົບທັງໝົດ</p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>ເພີ່ມຜູ້ໃຊ້ໃໝ່</span>
            </button>
          </div>

          <div className="relative max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ຄົ້ນຫາຊື່, ເບີໂທ, ອີເມວ ແລະ ຊື່ຜູ້ໃຊ້"
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-indigo-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
            />
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
              <p className="text-sm font-medium text-slate-500">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
            </div>
          ) : (
            <TableComponent columns={UserColumn} data={users}>
              {(user, index, globalIndex) => (
                <tr key={user.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="py-3 px-4 text-center font-medium text-slate-500">
                    {globalIndex + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-indigo-900">
                    {user.name} {user.lastname}
                  </td>
                  {user.gender === 'MALE' ? (
                    <td className="py-3 px-4 text-indigo-800">
                      <span className="px-2 py-1 rounded-md border-indigo-900 bg-indigo-200 text-xs font-semibold">ຊາຍ</span>
                    </td>
                  ) : (
                    <td className="py-3 px-4 text-pink-800">
                      <span className="px-2 py-1 rounded-md border-pink-900 bg-pink-200 text-xs font-semibold">ຍິງ</span>
                    </td>
                  )}
                  <td className="py-3 px-4 text-slate-700">
                    {user.contact}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {user.email || "-"}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {user.username}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                        title="ແກ້ໄຂ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                        title="ລຶບ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </TableComponent>
          )}

          <UserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddSubmit}
          />
          <EditUserModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditSubmit}
            initialData={selectedUser}
          />
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            userName={userToDelete ? `${userToDelete.name} ${userToDelete.lastname || ""}` : ""}
          />
        </div>
      </NavbarSidebar>
    </ProtectedRoute>
  );
}