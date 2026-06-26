"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface SessionUser extends User {
  id: string;
  email?: string;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function getSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user as SessionUser | null);
      setIsLoading(false);
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as SessionUser | null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, isLoading };
}
