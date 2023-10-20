// Maybe derive nav and footer items from router.pathname?
import { useRouter } from "next/router";
import { MainNav } from "./main-nav";
import { useAuth } from "./auth-and-context";
import { useEffect } from "react";
import { UserAccountNav } from "./user-account-nav";
import { SiteFooter } from "./site-footer";
import { useSession } from "next-auth/react";
import { FooterConfig } from "@/types";
import { trpc } from "@/utils/trpc";
import { Icons } from "./icons";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  footerItems: FooterConfig;
  setWarning?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

export default function AuthenticatedLayout({
  children,
  footerItems,
  setWarning,
  className = "",
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const { programs, setPrograms, exerciseSessions, setExerciseSessions, weightUnit, setWeightUnit, currentProgram, setCurrentProgram, setPasswordSet, setWorkoutSummary, setSelectedProgramSession, loggingOut } = useAuth();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/login"); // Redirect to login page if not authenticated
    }
  }, [session, status, router]);

  const initialiseContext = trpc.layout.initialise.useQuery(
    session?.user?.id,
    { enabled: false }
  )

  useEffect(() => {
    const unitPreference = localStorage.getItem("weightUnit") as "KG" | "LB"
    if (unitPreference && unitPreference !== weightUnit && setWeightUnit)
      setWeightUnit(unitPreference)
  }, [weightUnit, setWeightUnit])

  useEffect(() => {
    if (loggingOut || exerciseSessions || programs || currentProgram) return
    if (session && !initialiseContext.data)
      initialiseContext.refetch()
    else if (initialiseContext.data && setExerciseSessions && setPrograms && setCurrentProgram && setPasswordSet) {
      const { allSessions, passwordSet, allPrograms, currentProgram: selectedProgram }
        = initialiseContext.data

      if (allSessions)
        setExerciseSessions(
          allSessions.map(sess => ({
            ...sess,
            date: new Date(sess.date),
          }))
        )

      if (passwordSet)
        setPasswordSet(true)

      if (allPrograms)
        setPrograms(allPrograms)

      if (
        selectedProgram.programId &&
        selectedProgram.programName &&
        selectedProgram.startDate
      )
        setCurrentProgram({
          ...selectedProgram,
          startDate: new Date(selectedProgram.startDate)
        })

    }
  }, [exerciseSessions, programs, currentProgram, session, initialiseContext, setExerciseSessions, setPrograms, setCurrentProgram, setPasswordSet, loggingOut])
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          {initialiseContext.isLoading && <Icons.spinner className="absolute left-[49.5%] h-4 w-4 animate-spin" />}
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
            className="border-t sticky bottom-0 bg-background"
            footerItems={footerItems}
            setWarning={setWarning}
          />
        </>
      )}
    </div>
  );
}
