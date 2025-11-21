import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase
      .from('plays')
      .select('*')
      .eq('user_id', input.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      drawing: p.drawing,
      createdAt: p.created_at,
    }));
  });
