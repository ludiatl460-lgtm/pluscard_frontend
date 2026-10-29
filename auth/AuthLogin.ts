import api from "@/config/axios";
import { toast } from "react-toastify";

export const AuthLogin = async (username: string, password: string) => {
  try {
    const res = await api.post("/auth/login", { username, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data.user.id);
    localStorage.setItem("userInfo", JSON.stringify(res.data.user));
    toast.success("ເຂົ້າສູ່ລະບົບສຳເລັດ");
    console.log(res.data);
    return res.data;

  } catch (error: any) {
    console.error(error);
    if (error.response && error.response.status === 401) {
      toast.error("ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
    } else {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນເຊີບເວີ");
    }
    
    throw error;
  }
};