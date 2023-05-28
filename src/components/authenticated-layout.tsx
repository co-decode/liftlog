import { useRouter } from "next/router";
import { MainNav } from "./main-nav";
import AuthProvider, { useAuth } from "./auth-and-context";
import { useEffect, useContext } from "react";
import { UserAccountNav } from "./user-account-nav";
import { SiteFooter } from "./site-footer";
import { Icons } from "./icons";
import { useSession } from "next-auth/react";
import { FooterConfig, NavConfig } from "@/types";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  navItems: NavConfig
  footerItems: FooterConfig;
}

export default function AuthenticatedLayout({
  children,
  navItems,
  footerItems,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const context = useAuth();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login"); // Redirect to login page if not authenticated
    }
  }, [session, status, router]);

  useEffect(() => {
    console.log("layout", context);
  }, [context]);

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col space-y-6">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav items={navItems} />
            {status !== "authenticated" ? null : (
              <UserAccountNav
                user={{
                  name: session?.user?.name,
                  image: session?.user?.image,
                  email: session?.user?.email,
                }}
              />
            )}
          </div>
        </header>
        {status !== "authenticated" ? null : (
          <>
            <main className="flex w-full flex-1 flex-col overflow-hidden">
              {children}
            </main>
            <SiteFooter className="border-t" footerItems={footerItems} />
          </>
        )}
      </div>
    </AuthProvider>
  );
}
