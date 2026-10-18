"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  Suspense,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

export type AuthTab = "masuk" | "daftar";

interface AuthModalContextType {
  isOpen: boolean;
  tab: AuthTab;
  kosId: string | null;
  openModal: (tab?: AuthTab, kosId?: string | null) => void;
  closeModal: () => void;
  setTab: (tab: AuthTab) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);

function QueryParamListener({
  openModal,
}: {
  openModal: (tab?: AuthTab, kosId?: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    const kos = searchParams.get("kos");
    if (auth === "masuk" || auth === "daftar") {
      openModal(auth, kos);
    }
  }, [searchParams, openModal]);

  return null;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthTab>("masuk");
  const [kosId, setKosId] = useState<string | null>(null);

  const openModal = useCallback((newTab: AuthTab = "masuk", newKosId: string | null = null) => {
    setTab(newTab);
    setKosId(newKosId);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        tab,
        kosId,
        openModal,
        closeModal,
        setTab,
      }}
    >
      <Suspense fallback={null}>
        <QueryParamListener openModal={openModal} />
      </Suspense>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
