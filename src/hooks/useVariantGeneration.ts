import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ExtractedData, VariantResult } from "@/lib/types";

export type WorkflowStage = "input" | "review" | "results";

export function useVariantGeneration() {
  const [stage, setStage] = useState<WorkflowStage>("input");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [result, setResult] = useState<VariantResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractVariables = async (rawText: string) => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "extract-variables",
        { body: { rawText } }
      );

      if (fnError) throw new Error(fnError.message || "Failed to extract variables");
      if (data?.error) throw new Error(data.error);
      if (!data?.variables || !Array.isArray(data.variables)) {
        throw new Error("Invalid response format from extractor");
      }

      setExtractedData(data as ExtractedData);
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Variable extraction error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFromExtracted = async (data: ExtractedData) => {
    setIsLoading(true);
    setError(null);

    // Reconstruct a rich prompt from the extracted & edited data
    const prompt = buildPromptFromExtracted(data);

    try {
      const { data: resData, error: fnError } = await supabase.functions.invoke(
        "generate-variants",
        { body: { masterQuestion: prompt } }
      );

      if (fnError) throw new Error(fnError.message || "Failed to generate variants");
      if (resData?.error) throw new Error(resData.error);
      if (!resData?.variants || !Array.isArray(resData.variants)) {
        throw new Error("Invalid response format from generator");
      }

      setResult(resData as VariantResult);
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Variant generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStage("input");
    setExtractedData(null);
    setResult(null);
    setError(null);
  };

  const backToReview = () => {
    setStage("review");
    setResult(null);
    setError(null);
  };

  return {
    stage,
    extractedData,
    result,
    isLoading,
    error,
    extractVariables,
    generateFromExtracted,
    setExtractedData,
    reset,
    backToReview,
  };
}

function buildPromptFromExtracted(data: ExtractedData): string {
  const lines: string[] = [];
  lines.push(`Subject: ${data.context.subject}`);
  lines.push(`Model: ${data.context.model}`);
  lines.push(`Market Type: ${data.context.marketType}`);
  lines.push(`Country/Region: ${data.context.country}`);
  lines.push("");
  lines.push("Key Variables:");
  for (const v of data.variables) {
    lines.push(`  ${v.name} (${v.symbol}) = ${v.value} ${v.unit}`);
  }
  lines.push("");
  lines.push(`Primary Formula: $${data.formula}$`);
  lines.push("");
  lines.push(`Question: ${data.questionText}`);
  return lines.join("\n");
}
