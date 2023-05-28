import Layout from "@/components/authenticated-layout"
import { Icons } from "@/components/icons";
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer";
import { UserAccountNav } from "@/components/user-account-nav"
import { dashboardConfig } from "@/config/footer-config";
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import { useEffect } from "react";


export default function Dashboard() {
  const { data: session, status } = useSession()

  const router = useRouter();
  useEffect(() => {
    if (!session && status !== "loading") {
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <Layout navItems={dashboardConfig.navItems} footerItems={dashboardConfig.footerItems}>
      <div> Hello, I wonder if this is goin to work? </div>
    </Layout>
  )
}
/*
<div className="flex min-h-screen flex-col space-y-6">
<header className="sticky top-0 z-40 border-b bg-background">
<div className="container flex h-16 items-center justify-between py-4">
<MainNav items={navItems} />
{status !== "authenticated" ? null :
  <UserAccountNav
    user={{
name: session?.user?.name,
        image: session?.user?.image,
        email: session?.user?.email,
    }}
  />
}
</div>
</header>
{status !== "authenticated" ? null :
  <>
    <main className="flex w-full flex-1 flex-col overflow-hidden">
    {children}
  </main>
    <SiteFooter className="border-t" footerItems={footerItems} />
    </>
}
</div>
*/

{/*
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
    <aside className="hidden w-[200px] flex-col md:flex">
    <DashboardNav items={dashboardConfig.sidebarNav} />
    </aside>
    <main className="flex w-full flex-1 flex-col overflow-hidden">
    {children}
    </main>
    </div>
    <SiteFooter className="border-t" />
    */}
