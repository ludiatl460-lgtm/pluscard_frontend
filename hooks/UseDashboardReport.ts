"use client";
import { useEffect } from "react";
import { DashboardReportStore } from "@/stores/DashboardStore";

export const useDashboardReport = () => {
         const store = DashboardReportStore();
         useEffect(() => { store.getDashboardReport() }, []);

         return {
            error: store.error,
            loading: store.loading,
            reports: store.reports
         }
}