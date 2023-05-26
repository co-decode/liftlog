import { router } from '../trpc';

import { usersRouter } from './users';
import { sessionsRouter } from './sessions';

export const appRouter = router ({
  users: usersRouter,
  sessions: sessionsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter;
