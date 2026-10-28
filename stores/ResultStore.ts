import {create} from "zustand";
import { getAllResults, createResult } from "@/services/ResultService";
import { Result } from "@/types/Result";

interface ResultState {
   results: Result[];
   error: string | null;
   loading: boolean;

   getAllResults: () => Promise<void>;
   createResult: (result: Result) => Promise<void>;
}

export const ResultStore = create<ResultState>((set)=>({
    results: [],
    error: null,
    loading: false,
    getAllResults: async() => {
       try {
         set({loading: true});
         const result: Result[] = await getAllResults();
         set({
            results: result,
            loading: false
         });
       } catch (e: any) {
          set({error: e, loading: false});
       }
    },
    createResult: async(result: Result) => {
      try {
         const newResult:Result = await createResult(result);
         set((state)=>({
            results: [...state.results, newResult]
         }));
      } catch (e: any) {
         set({error: e});
      }
    }
}))