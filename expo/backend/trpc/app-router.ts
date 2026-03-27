import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import teamsRoute from "./routes/teams/route";
import gamesRoute from "./routes/games/route";
import eventsRoute from "./routes/events/route";
import playersRoute from "./routes/players/route";
import fansRoute from "./routes/fans/route";
import playsRoute from "./routes/plays/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  teams: createTRPCRouter({
    getAll: teamsRoute,
  }),
  games: createTRPCRouter({
    getAll: gamesRoute,
  }),
  events: createTRPCRouter({
    getAll: eventsRoute,
  }),
  players: createTRPCRouter({
    getAll: playersRoute,
  }),
  fans: createTRPCRouter({
    getAll: fansRoute,
  }),
  plays: createTRPCRouter({
    getAll: playsRoute,
  }),
});

export type AppRouter = typeof appRouter;
