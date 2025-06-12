"use client";

import React, { createContext, useContext } from "react";

const NonceContext = createContext<string | undefined>(undefined);

export const NonceProvider = ({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce: string;
}) => {
  return (
    <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
  );
};

export const useNonce = () => {
  const context = useContext(NonceContext);
  if (!context) throw new Error("useNonce must be used inside a NonceProvider");
  return context;
};
