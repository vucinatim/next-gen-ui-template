import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setLoading: (loading: boolean) => {
    console.log("set loading: ", loading, new Date().toTimeString());
    set({ isLoading: loading });
  },
}));
