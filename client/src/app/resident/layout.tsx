"use client";

import { usePathname } from "next/navigation";
import ResidentAppShell from "@/components/resident/ResidentAppShell";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic =
    pathname === "/resident/login" || pathname === "/resident/register";

  if (isPublic) {
    return <>{children}</>;
  }

  return <ResidentAppShell>{children}</ResidentAppShell>;
}
