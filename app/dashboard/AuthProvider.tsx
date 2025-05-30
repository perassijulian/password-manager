"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

import Cookies from "js-cookie";

export const AuthSessionGuard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const expiry = decoded.exp * 1000;
      const now = Date.now();

      if (expiry < now) {
        Cookies.remove("token");
        router.push("/login");
        return;
      }

      const timeout = setTimeout(() => {
        Cookies.remove("token");
        router.push("/login");
      }, expiry - now);

      return () => clearTimeout(timeout);
    } catch (err) {
      console.error("JWT decode error:", err);
      Cookies.remove("token");
      router.push("/login");
    }
  }, []);

  return null;
};
