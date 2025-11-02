// ========================================
// STORE - Session BdF dans le Chat
// ========================================
// Store Zustand pour mémoriser la dernière analyse BdF

import { create } from "zustand";
import type { BdfAnalysis } from "@/types/bdf";

interface BdfSessionState {
  lastAnalysis: BdfAnalysis | null;
  setLastAnalysis: (analysis: BdfAnalysis | null) => void;
  clearLastAnalysis: () => void;
}

export const useBdfSession = create<BdfSessionState>((set) => ({
  lastAnalysis: null,
  setLastAnalysis: (analysis) => set({ lastAnalysis: analysis }),
  clearLastAnalysis: () => set({ lastAnalysis: null }),
}));
