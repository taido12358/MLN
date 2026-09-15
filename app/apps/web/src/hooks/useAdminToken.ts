"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readAdminToken } from "@/lib/storage";

/** Reads the stored admin JWT on mount and redirects to /host if missing — previously duplicated
 * verbatim (`localStorage.getItem("mln:adminToken")` + `router.replace("/host")`) in both
 * host/content and host/rooms pages. Returns null while checking/redirecting. */
export function useAdminToken(): string | null {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = readAdminToken();
    if (!t) {
      router.replace("/host");
      return;
    }
    setToken(t);
  }, [router]);

  return token;
}
