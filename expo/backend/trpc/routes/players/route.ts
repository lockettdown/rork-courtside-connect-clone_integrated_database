import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      jerseyNumber: p.jersey_number,
      position: p.position,
      teamId: p.team_id,
      stats: {
        points: p.points,
        assists: p.assists,
        rebounds: p.rebounds,
        offensiveRebounds: p.offensive_rebounds,
        defensiveRebounds: p.defensive_rebounds,
        steals: p.steals,
        blocks: p.blocks,
        turnovers: p.turnovers,
        fouls: p.fouls,
      },
    }));
  });
