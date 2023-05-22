import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav";
import { cn } from "@/lib/utils";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const navItems = [
    { title: "Dashboard", href: "#" },
    { title: "Workouts", href: "#" },
    { title: "Sessions", href: "#" },
    { title: "Schedule", href: "#" },
    { title: "Community", href: "#" },
    { title: "Exercise Library", href: "#" }
]

export default function IndexPage() {
  const { data: session, status } = useSession();

  const router = useRouter();
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === "loading") return (
    <div>LOADING</div>
  )

  return (
    <>
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={navItems}/>
          <nav>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "px-4"
              )}
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
