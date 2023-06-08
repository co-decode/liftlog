import { LucideIcon } from "lucide-react"

export type NavConfig = { title: string, href: string }[]
type FooterConfig = { icon: LucideIcon, href: string }[]
export interface AuthenticatedConfig {
  navItems: NavConfig
  footerItems: FooterConfig
}
