import api from "@/config/axios";
import { toast } from "react-toastify";

export const getDashboardReport = async() =>{ 
  try {
         const res = await api.get("/reports");
         return res.data.data;
  } catch (e: any) {
         console.error(e);
         toast.error(e || "ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້");
         throw e;
  }
}