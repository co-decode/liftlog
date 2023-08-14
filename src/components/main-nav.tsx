"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { MobileNav } from "./mobile-nav";
import { useSession } from "next-auth/react";

type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

interface MainNavProps {
  items?: NavItem[];
  children?: React.ReactNode;
}

export function MainNav({ items, children }: MainNavProps) {
  //const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  const { status } = useSession()

  function returnHref() {
    return status === "authenticated"
      ? "/dashboard"
      : status === "unauthenticated"
      ? "/"
      : ""
  }

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href={returnHref()} className="items-center space-x-2 flex">
        <Icons.dumbbell />
        <span className="font-bold inline-block">{"LiftLog"}</span>
      </Link>
    </div>
  );
}
