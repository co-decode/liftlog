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
  const { programs, setPrograms, exerciseSessions, setExerciseSessions, weightUnit, setWeightUnit, currentProgram, setCurrentProgram } = useAuth();
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
    if (exerciseSessions || programs || currentProgram) return
    if (session && !initialiseContext.data)
      initialiseContext.refetch()
    else if (initialiseContext.data && setExerciseSessions && setPrograms && setCurrentProgram) {
      const { allSessions, allPrograms, currentProgram: selectedProgram }
        = initialiseContext.data

      if (allSessions)
        setExerciseSessions(
          allSessions.map(sess => ({
            ...sess,
            date: new Date(sess.date),
          }))
        )

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
  }, [exerciseSessions, programs, currentProgram, session, initialiseContext, setExerciseSessions, setPrograms, setCurrentProgram])
/*
  const getSessions = trpc.sessions.findSessions
    .useQuery(session?.user?.id, {
      enabled: false
    });

  const getPrograms = trpc.programs.findPrograms.useQuery(
    session?.user?.id,
    { enabled: false }
  )

  const getCurrentProgram = trpc.programs.findCurrentProgram.useQuery(
    session?.user?.id,
    { enabled: false }
  )

  // Ideally would want to combine call for exercises and programs into a transaction
  useEffect(() => {
    if (exerciseSessions) return
    if (session && !getSessions.data)
      getSessions.refetch()
    else if (getSessions.data && setExerciseSessions)
      setExerciseSessions(
        getSessions.data.map(sess => ({
          ...sess,
          date: new Date(sess.date),
        }))
      )
    // Is it possible for the user's information to be persisted beyond log out?
  }, [exerciseSessions, setExerciseSessions, getSessions.data, getSessions, session]);

  useEffect(() => {
    if (programs) return
    if (session && !getPrograms.data)
      getPrograms.refetch()
    if (getPrograms.data && setPrograms)
      setPrograms(getPrograms.data)
  }, [programs, setPrograms, getPrograms.data, getPrograms, session])

  useEffect(() => {
    if (currentProgram) return
    if (session && !getCurrentProgram.data && programs)
      getCurrentProgram.refetch()
    if (getCurrentProgram.data && setCurrentProgram && programs) {
      const { programName, programId, startDate } = getCurrentProgram.data
      setCurrentProgram({ programName, programId, startDate: new Date(startDate) })
    } else if (setCurrentProgram && getCurrentProgram.data === null)
      setCurrentProgram({})
  }, [currentProgram, setCurrentProgram, getCurrentProgram.data, getCurrentProgram, session, programs])
*/
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
            className="border-t sticky bottom-0 bg-background"
            footerItems={footerItems}
            setWarning={setWarning}
          />
        </>
      )}
    </div>
  );
}
