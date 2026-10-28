"use client"
import { useState, useMemo, useEffect } from "react";
import { UserStore } from "@/stores/UserStore";

export const useUser = () => {
  const [search, setSearch] = useState("");
  const store = UserStore();

  useEffect(() => {
    store.getAllUsers();
  }, []);

  const filteredUser = useMemo(() => {
    if (!store.users) return [];
    const sortedUsers = [...store.users].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    return sortedUsers.filter((item) =>
      item?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item?.lastname?.toLowerCase().includes(search.toLowerCase()) ||
      item?.contact?.toLowerCase().includes(search.toLowerCase()) ||
      item?.email?.toLowerCase().includes(search.toLowerCase()) ||
      item?.username?.toLowerCase().includes(search.toLowerCase())
    );
  }, [store.users, search]);

  return {
    users: filteredUser,
    error: store.error,
    loading: store.loaoding,
    search,
    setSearch,
    user: store.user,
    getUserById: store.getUserById,
    creatUser: store.createUser,
    updateUser: store.updateUser,
    deleteUser: store.deleteUser
  }
}