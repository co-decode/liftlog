import { router } from '../trpc';

import { usersRouter } from './users';
import { sessionsRouter } from './sessions';
import { programsRouter } from './programs';

export const appRouter = router ({
  users: usersRouter,
  sessions: sessionsRouter,
  programs: programsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter;
