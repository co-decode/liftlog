import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext } from 'react';
import { z } from 'zod';

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

export type Schema = z.infer<typeof ExerciseSessionSchema>

interface AuthContextValue {
  exerciseSessions: Schema | undefined;
}

const AuthContext = createContext<AuthContextValue>({exerciseSessions:undefined});

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const authContextValue: AuthContextValue = {
    exerciseSessions: undefined,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

