import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert Economics Exam Variant Generator with deep knowledge of economic models, formulas, and mathematical reasoning.

Given a master economics exam question, generate THREE distinct variants with increasing structural complexity:

## BRONZE (Surface Level)
- **Variable Swap**: Change numerical values (e.g., interest rate 5% → 3%, MPC 0.75 → 0.6)
- **Entity Swap**: Change countries, brands, or entity names (e.g., USA → Germany)
- **Constraint**: All values MUST be realistic:
  - MPC must be between 0 and 1
  - Interest/tax rates must be positive and reasonable (0-100%)
  - Prices, quantities, GDP must be positive
  - Unemployment cannot be negative

## SILVER (Contextual Shift)
- **Scenario Change**: Change the industry or market context (e.g., agriculture → technology)
- **Directional Shift**: Reverse the policy direction (e.g., expansionary → contractionary, tax cut → tax increase)
- Adjust all numerical values to be consistent with the new context and direction

## GOLD (Structural Reversal)
- **Inverse Logic**: Swap independent and dependent variables (e.g., "Calculate GDP given I" → "Find required I for target GDP")
- **Model Expansion**: Add a new variable or complexity (e.g., closed → open economy with Net Exports NX)
- All mathematics must remain internally consistent and solvable

## CRITICAL REQUIREMENTS
1. Every variant MUST have a complete, mathematically correct solution
2. Show ALL intermediate steps — no skipping
3. Use $...$ for inline math and $$...$$  for display math in ALL text
4. Verify ALL final answers are realistic (positive prices, valid ranges, etc.)
5. Each solution step must clearly state WHAT is being calculated and WHY
6. The question text should be a complete, self-contained exam question`;

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "generate_variants",
      description:
        "Generate three economics exam question variants (Bronze, Silver, Gold) with complete step-by-step solutions",
      parameters: {
        type: "object",
        properties: {
          masterAnalysis: {
            type: "object",
            description: "Analysis of the original master question",
            properties: {
              subject: {
                type: "string",
                description:
                  "Economics subject area, e.g. Macroeconomics, Microeconomics, International Economics",
              },
              model: {
                type: "string",
                description:
                  "Economic model or framework, e.g. Keynesian Cross, Supply-Demand, IS-LM",
              },
              keyVariables: {
                type: "array",
                items: { type: "string" },
                description: "Key variables identified in the question",
              },
              formula: {
                type: "string",
                description:
                  "Primary formula in LaTeX notation, e.g. Y = C + I + G",
              },
            },
            required: ["subject", "model", "keyVariables", "formula"],
            additionalProperties: false,
          },
          variants: {
            type: "array",
            description: "Exactly three variants: bronze, silver, gold in order",
            items: {
              type: "object",
              properties: {
                tier: {
                  type: "string",
                  enum: ["bronze", "silver", "gold"],
                  description: "Difficulty/complexity tier",
                },
                title: {
                  type: "string",
                  description:
                    "Short descriptive title for this variant (max 8 words)",
                },
                question: {
                  type: "string",
                  description:
                    "Complete exam question text with LaTeX math. Use $ for inline and $$ for display math.",
                },
                changes: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "List of specific changes made from the original master question",
                },
                solution: {
                  type: "object",
                  properties: {
                    steps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          stepNumber: { type: "number" },
                          description: {
                            type: "string",
                            description: "What this step accomplishes",
                          },
                          formula: {
                            type: "string",
                            description:
                              "The general formula or equation in LaTeX",
                          },
                          calculation: {
                            type: "string",
                            description:
                              "The actual calculation with substituted numbers in LaTeX",
                          },
                          result: {
                            type: "string",
                            description: "Result of this step",
                          },
                        },
                        required: [
                          "stepNumber",
                          "description",
                          "formula",
                          "calculation",
                          "result",
                        ],
                        additionalProperties: false,
                      },
                    },
                    finalAnswer: {
                      type: "string",
                      description:
                        "Clear final answer statement with LaTeX math notation",
                    },
                  },
                  required: ["steps", "finalAnswer"],
                  additionalProperties: false,
                },
              },
              required: ["tier", "title", "question", "changes", "solution"],
              additionalProperties: false,
            },
          },
        },
        required: ["masterAnalysis", "variants"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { masterQuestion } = await req.json();

    if (!masterQuestion || typeof masterQuestion !== "string") {
      return new Response(
        JSON.stringify({ error: "masterQuestion is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Generate three variants (Bronze, Silver, Gold) of the following economics exam question. Ensure all mathematics is correct and all answers are verified.\n\n${masterQuestion}`,
            },
          ],
          tools: TOOLS,
          tool_choice: {
            type: "function",
            function: { name: "generate_variants" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please wait a moment and try again.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI usage limit reached. Please add credits to your workspace to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to generate variants. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({
          error: "Invalid AI response format. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;
    try {
      result =
        typeof toolCall.function.arguments === "string"
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
    } catch (parseError) {
      console.error("Failed to parse tool call arguments:", parseError);
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response. Please try again.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-variants error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
