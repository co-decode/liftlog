import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@/server/routers/_app";


export type Programs = inferProcedureOutput<AppRouter["programs"]["findPrograms"]>
export type Sessions = NonNullable<inferProcedureOutput<AppRouter["layout"]["initialise"]>>["allSessions"]
type ProgramSession = {
  programName: string,
  programSession: Programs[number]["programSessions"][number]
}
export type Summary = inferProcedureInput<AppRouter["sessions"]["createSession"]>["exerciseSessions"]
type CurrentProgram = Partial<{ startDate: Date, programName: string, programId: number }>

interface AuthContextValue {
  programs?: Programs
  setPrograms?: Dispatch<SetStateAction<Programs | undefined>>

  exerciseSessions?: Sessions
  setExerciseSessions?: Dispatch<SetStateAction<Sessions | undefined>>;

  selectedProgramSession?: ProgramSession
  setSelectedProgramSession?: Dispatch<SetStateAction<ProgramSession | undefined>>
  
  workoutSummary?: Summary
  setWorkoutSummary?: Dispatch<SetStateAction<Summary | undefined>>

  weightUnit: "KG" | "LB"
  setWeightUnit?: Dispatch<SetStateAction<"KG" | "LB">>

  currentProgram?: CurrentProgram
  setCurrentProgram?: Dispatch<SetStateAction<CurrentProgram | undefined>>
}

const AuthContext = createContext<AuthContextValue>({ weightUnit: "KG" });

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthProvider({
  children,
}: AuthenticatedLayoutProps) {
  const [exerciseSessions, setExerciseSessions] = useState<Sessions>();
  const [programs, setPrograms] = useState<Programs>();
  const [selectedProgramSession, setSelectedProgramSession] = useState<ProgramSession>()
  const [workoutSummary, setWorkoutSummary] = useState<Summary>()
  const [weightUnit, setWeightUnit] = useState<"KG" | "LB">("KG")
  const [currentProgram, setCurrentProgram] = useState<CurrentProgram>()

  return (
    <AuthContext.Provider value={{
      exerciseSessions,
      setExerciseSessions,
      programs,
      setPrograms,
      selectedProgramSession,
      setSelectedProgramSession,
      workoutSummary,
      setWorkoutSummary,
      weightUnit,
      setWeightUnit,
      currentProgram,
      setCurrentProgram,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
