import * as React from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SiteFooterProps {
  className: string;
  footerItems: { icon: LucideIcon; href: string }[];
  setWarning?: React.Dispatch<React.SetStateAction<string>>;
  loading?: boolean;
}

export function SiteFooter({
  className,
  footerItems,
  setWarning,
  loading,
}: SiteFooterProps) {
  function handleNavigation(
    href: string,
    e: React.MouseEvent<HTMLButtonElement | MouseEvent>
  ) {
    if (loading) {
      e.preventDefault()
    }
    else if (setWarning) {
      e.preventDefault();
      setWarning(href);
    }
  }
  return (
    <footer className={cn(className)}>
      <div className="container h-12 px-0 grid grid-cols-3 place-items-center">
        {footerItems.map((item) => (
          <Button
            key={item.href}
            onClick={(e) => handleNavigation(item.href, e)}
            variant="ghost"
            asChild
          >
            <Link
              key={item.href}
              href={item.href}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
             <item.icon /> 
            </Link>
          </Button>
        ))}
      </div>
    </footer>
  );
}
