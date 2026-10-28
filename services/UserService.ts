import api from "@/config/axios";
import { toast } from "react-toastify";
import { User } from "@/types/User";

export const getAllUsers = async() => {
  try {
       const res = await api.get("/users");
       console.log(res.data)
       return res.data.data;  
  } catch (e: any) {
       console.error(e);
       toast.error(e || "ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້")  
  }
}

export const createUser = async(user: User) => {
   try {
         const res = await api.post("/users", user);
         toast.success("ເພີ່ມຂໍ້ມູນສຳເລັດ")
         return res.data.data;
   } catch (e: any) {
         console.error(e);
         toast.error(e || "ເພີ່ມຂໍ້ມູນລົ້ມເຫຼວ")
   }
}

export const getUserById = async(id: string) => {
       try {
       const res = await api.get(`/users/${id}`);
       console.log(res.data)
       return res.data.data;  
  } catch (e: any) {
       console.error(e);
       toast.error(e || "ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້")  
  }
}  

export const updateUser = async(id: string, user: User) => {
   try {
         const { id: _idToRemove, createdAt, updatedAt, ...safeUser } = user as any;
         const payload = {
           ...safeUser,
           ...(safeUser.password !== undefined && safeUser.password !== null && String(safeUser.password).trim() === ""
             ? { password: undefined }
             : {}),
         };

         if (payload.password === undefined) {
           delete payload.password;
         }
         const res = await api.put(`/users/${id}`, payload);
         toast.success('ແກ້ໄຂຂໍ້ມູນສຳເລັດ')
         return res.data.data;
   } catch (e: any) {
         const message = e?.response?.data?.message || e?.message || "ແກ້ໄຂຂໍ້ມູນລົ້ມເຫຼວ";
         console.error('Update user error:', e);
         toast.error(message)
         throw e;
   }     
}


export const deleteUser = async (id: string) => {
   try {
        const res = await api.delete(`/users/${id}`);
        toast.success("ລົບຂໍ້ມູນສຳເລັດ")
        return res.data.data 
   } catch (e: any) {
          console.error(e);
         toast.error(e || "ລົບຂໍ້ມູນລົ້ມເຫຼວ")
   }
}