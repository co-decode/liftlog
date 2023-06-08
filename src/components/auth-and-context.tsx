import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { z } from "zod";
import { sessionSchema } from "@/types/schema-receiving";

export type Schema = z.infer<typeof sessionSchema>;

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
}

export default function AuthProvider({ 
  children,
}: AuthenticatedLayoutProps) {
  const [exerciseSessions, setExerciseSessions] = useState<Schema[]>();

  return (
    <AuthContext.Provider value={{ exerciseSessions, setter:setExerciseSessions}}>
        {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
