import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert Economics question parser. Given raw text from a PDF or exam paper, extract the structured data.

Your job:
1. Identify the Economic Context: subject area, economic model/framework, market type, and country/region.
2. Identify ALL Key Variables: every named parameter with its symbol, value, and unit.
3. Identify the primary formula(s) in LaTeX.
4. Extract the exact question being asked.

Be thorough — capture every numerical value and variable mentioned.`;

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "extract_variables",
      description: "Extract economic context and key variables from raw exam text",
      parameters: {
        type: "object",
        properties: {
          context: {
            type: "object",
            properties: {
              subject: { type: "string", description: "e.g. Macroeconomics, Microeconomics" },
              model: { type: "string", description: "e.g. Keynesian Cross, Supply-Demand, IS-LM" },
              marketType: { type: "string", description: "e.g. Closed economy, Open economy, Perfect competition" },
              country: { type: "string", description: "Country or region mentioned, or 'General' if none" },
            },
            required: ["subject", "model", "marketType", "country"],
            additionalProperties: false,
          },
          variables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", description: "Human-readable name, e.g. Marginal Propensity to Consume" },
                symbol: { type: "string", description: "LaTeX symbol, e.g. MPC, C, Y, r" },
                value: { type: "string", description: "Numerical value as string, e.g. '0.75', '200', '5%'" },
                unit: { type: "string", description: "Unit or description, e.g. 'dollars', 'percent', 'dimensionless'" },
              },
              required: ["name", "symbol", "value", "unit"],
              additionalProperties: false,
            },
            description: "All key variables with their values",
          },
          formula: {
            type: "string",
            description: "Primary formula in LaTeX, e.g. Y = C + I + G",
          },
          questionText: {
            type: "string",
            description: "The core question being asked, cleaned up",
          },
        },
        required: ["context", "variables", "formula", "questionText"],
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
    const { rawText } = await req.json();

    if (!rawText || typeof rawText !== "string") {
      return new Response(
        JSON.stringify({ error: "rawText is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
              content: `Extract all economic context and variables from this raw exam text:\n\n${rawText}`,
            },
          ],
          tools: TOOLS,
          tool_choice: { type: "function", function: { name: "extract_variables" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to extract variables. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Invalid AI response. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;
    try {
      result = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("extract-variables error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
