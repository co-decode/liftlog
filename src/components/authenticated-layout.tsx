// Maybe derive nav and footer items from router.pathname?
import { useRouter } from "next/router";
import { MainNav } from "./main-nav";
import { useAuth } from "./auth-and-context";
import { useEffect } from "react";
import { UserAccountNav } from "./user-account-nav";
import { SiteFooter } from "./site-footer";
import { useSession } from "next-auth/react";
import { FooterConfig, NavConfig } from "@/types";
import { trpc } from "@/utils/trpc";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  navItems: NavConfig;
  footerItems: FooterConfig;
  setWarning?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

export default function AuthenticatedLayout({
  children,
  navItems,
  footerItems,
  setWarning,
  className = "",
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const { exerciseSessions, setter: setExerciseSessions } = useAuth();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login"); // Redirect to login page if not authenticated
    }
  }, [session, status, router]);

  const getSessions = trpc.users.findAll
    .useQuery("cody@cody.com", {
      enabled: false
    });

  useEffect(() => {
    if (!exerciseSessions && setExerciseSessions) {
      getSessions.refetch()
      if (getSessions.data) {
        setExerciseSessions(getSessions.data.exerciseSessions);
      }
    }
  }, [exerciseSessions, setExerciseSessions, getSessions.data, getSessions]);

  return (
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
          <main
            className={
              "flex w-full flex-1 flex-col overflow-hidden " + className
            }
          >
            {children}
          </main>
          <SiteFooter
            className="border-t"
            footerItems={footerItems}
            setWarning={setWarning}
          />
        </>
      )}
    </div>
  );
}
