import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { z } from "zod";
import AuthenticatedLayout from "./authenticated-layout";
import { FooterConfig, NavConfig } from "@/types";

const SetSchema = z.object({
  reps: z.number(),
  weight: z.string(),
});

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.array(SetSchema),
});

const ExerciseSessionSchema = z.object({
  date: z.string(),
  exercises: z.array(ExerciseSchema),
});

export type Schema = z.infer<typeof ExerciseSessionSchema>;

interface AuthContextValue {
  exerciseSessions?: Schema[]
  setter?: Dispatch<SetStateAction<Schema[] | undefined>>;
}

const AuthContext = createContext<AuthContextValue>({
  exerciseSessions: undefined,
  setter: undefined,
});

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  navItems: NavConfig
  footerItems: FooterConfig;
  setWarning?: React.Dispatch<React.SetStateAction<string>>
  className?: string;
}

export default function AuthProvider({ 
  children,
  navItems,
  footerItems,
  setWarning,
  className = "",
}: AuthenticatedLayoutProps) {
  const [exerciseSessions, setExerciseSessions] = useState<Schema[]>();

  return (
    <AuthContext.Provider value={{ exerciseSessions, setter:setExerciseSessions}}>
      <AuthenticatedLayout 
        navItems={navItems} 
        footerItems={footerItems}
        setWarning={setWarning}
        className={className}
      >
        {children}
      </AuthenticatedLayout>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
