import { DashboardReport } from "@/types/Dashboard";
import { getDashboardReport } from "@/services/DashboardService";
import { create } from "zustand";

interface DashboardReportState {
  reports: DashboardReport | null;
  error: string | null;
  loading: boolean;
  getDashboardReport: () => Promise<void>;
}

export const DashboardReportStore = create<DashboardReportState>((set) => ({
  reports: null,
  error: null,
  loading: false,
  getDashboardReport: async () => {
    try {
      set({ loading: true, error: null });
      const data = (await getDashboardReport()) as DashboardReport;
      set({ reports: data, loading: false, error: null });
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "ບໍ່ສາມາດໂຫລດຂໍ້ມູນ Dashboard ໄດ້";
      set({ error: message, loading: false });
    }
  },
}));