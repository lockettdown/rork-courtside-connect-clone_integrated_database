import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((g: any) => ({
      id: g.id,
      homeTeamId: g.home_team_id,
      awayTeamId: g.away_team_id,
      homeScore: g.home_score,
      awayScore: g.away_score,
      quarter: g.quarter,
      date: g.date,
      location: g.location,
      playerGameStats: g.player_game_stats || {},
      onCourt: g.on_court || [],
      events: g.events || [],
    }));
  });
