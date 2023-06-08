import { useRouter } from "next/router";
import { useAuth } from "./auth-and-context";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";


interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const { exerciseSessions, setter: setExerciseSessions } = useAuth();
  const { status, data: session } = useSession();

  useEffect(() => {
    console.log(session?.user)
    if (!session && status !== "loading") {
      router.push("/login"); // Redirect to login page if not authenticated
    }
  }, [session, status, router]);


  useEffect(() => {
    if (!exerciseSessions && setExerciseSessions) {
      const getSessions = trpc.users.findAll.useQuery("cody@cody.com");
      if (getSessions.data) {
        setExerciseSessions(getSessions.data.exerciseSessions);
      }
    }
  }, [exerciseSessions, setExerciseSessions]);

  return (
    <>
      {children}
    </>
  );
}
