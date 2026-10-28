import { ResultStore } from "@/stores/ResultStore";
import { useState, useEffect, useMemo } from "react";

export const useResult =() => {
  const store = ResultStore();
  useEffect(()=>{
    store.getAllResults();
  }, []);
  return {
    error: store.error,
    results: store.results,
    loading: store.loading,
    createResult: store.createResult,
  }
}