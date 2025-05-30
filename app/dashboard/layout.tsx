import { AuthSessionGuard } from "./AuthProvider";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthSessionGuard />
      {children}
    </>
  );
}
