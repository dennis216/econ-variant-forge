import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { VariantResult } from "@/lib/types";

export function useVariantGeneration() {
  const [result, setResult] = useState<VariantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (masterQuestion: string) => {
    if (!masterQuestion.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-variants",
        { body: { masterQuestion } }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to call generation function");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.variants || !Array.isArray(data.variants)) {
        throw new Error("Invalid response format from generator");
      }

      setResult(data as VariantResult);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      console.error("Variant generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, isLoading, error, generate, reset };
}
