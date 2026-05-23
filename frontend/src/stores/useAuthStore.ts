import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  email: string;
  role: "visitor" | "agency" | "admin";
  status: "pending" | "active" | "rejected" | "suspended";
  agency_name: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  initAuth: () => void;
};

// TODO: ลบ mock user ออกเมื่อ Backend พร้อม
const MOCK_AGENCY_USER: User = {
  id: "1",
  email: "agency@test.com",
  role: "agency",
  status: "active",
  agency_name: "สพฐ. (ทดสอบ)",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Mock user ชั่วคราว — ลบออกเมื่อ Backend พร้อม
      token: "mock-token-agency",
      user: MOCK_AGENCY_USER,
      login: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
      },
      // TODO: เปิด initAuth จริงเมื่อ Backend พร้อม
      initAuth: () => {},
    }),
    { name: "auth" }
  )
);
