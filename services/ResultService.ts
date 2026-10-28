import api from "@/config/axios";
import { toast } from "react-toastify";
import { Result } from "@/types/Result";
export const getAllResults = async() => {
  try {
       const res = await api.get("/results");
       return res.data.data;  
  } catch (e: any) {
     console.error(e);
     toast.error(e || "ການໂຫລດຂໍ້ມູນລົ້ມເຫຼວ")
     throw e;
  }
}

export const createResult = async(result: Result) => {
  try {
      const res = await api.post("/results", result);
      toast.success("ການທຽບຍອດທຸລະກຳສຳເລັດແລ້ວ");
      return res.data.data;   
  } catch (e: any) {
     console.error(e);
     toast.error(e || "ການໂຫລດຂໍ້ມູນລົ້ມເຫຼວ")
     throw e; 
  }
}