import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((e: any) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      opponent: e.opponent,
      teamId: e.team_id,
      teamName: e.team_name,
      date: e.date,
      time: e.time,
      location: e.location,
      isHome: e.is_home,
    }));
  });
