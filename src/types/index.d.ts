import { LucideIcon } from "lucide-react"

type NavConfig = {title: string, href: string}[]
type FooterConfig = {icon: LucideIcon, href: string}[]
export interface AuthenticatedConfig {
  navItems: NavConfig
  footerItems: FooterConfig
}


