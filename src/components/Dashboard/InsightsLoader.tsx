// components/InsightsLoader.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { InfoCard } from "./InfoCard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface InsightsLoaderProps {
  userId: string;
}

export function InsightsLoader({ userId }: InsightsLoaderProps) {
  const [body, setBody] = useState("Loading insights…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      const { data, error } = await supabase.functions.invoke(
        "generate-insights",
        {
          // the body must be a plain JSON string
          body: JSON.stringify({ user_id: userId }),
        }
      );
      if (error) {
        console.error("Insights function error:", error);
        // If the function returned a JSON detail
        if ((error as any).details) {
          setError(`AI error: ${(error as any).details}`);
        } else {
          setError(error.message);
        }
        setBody("");
        return;
      } else if (typeof data === "string") {
        // if you returned a string
        setBody(data);
      } else if (data?.insights) {
        // if you returned { insights: string }
        setBody(data.insights);
      } else {
        setBody("No insights returned.");
      }
    })();
  }, [userId]);

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  return <InfoCard title="Your Personalized Insights" body={body} />;
}
