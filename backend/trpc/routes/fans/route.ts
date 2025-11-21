import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase
      .from('fans')
      .select('*')
      .eq('user_id', input.userId)
      .order('invited_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((f: any) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      teamId: f.team_id,
      playerId: f.player_id,
      playerName: f.player_name,
      status: f.status,
      invitedAt: f.invited_at,
      joinedAt: f.joined_at,
    }));
  });
