import * as React from "react"

//import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { buttonVariants } from "./ui/button"

interface SiteFooterProps {
  className: string,
  footerItems: {icon: React.ReactNode, href: string}[]
}

export function SiteFooter({ className, footerItems }: SiteFooterProps) {
  return (
    <footer className={cn(className)}>
      <div className="container h-12 px-0 grid grid-cols-3 place-items-center">
        {footerItems.map(item =>
          <Link key={item.href} href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
            )}
          >
            {item.icon}
          </Link>
        )}
      </div>
    </footer>
  )
}
