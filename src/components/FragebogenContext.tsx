"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import FragebogenModal from "./FragebogenModal";

interface FragebogenContextType {
  openModal: () => void;
}

const FragebogenContext = createContext<FragebogenContextType>({ openModal: () => {} });

export function FragebogenProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FragebogenContext.Provider value={{ openModal: () => setIsOpen(true) }}>
      {children}
      <FragebogenModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </FragebogenContext.Provider>
  );
}

export function useFragebogen() {
  return useContext(FragebogenContext);
}
