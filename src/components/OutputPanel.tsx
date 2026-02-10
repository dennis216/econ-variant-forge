import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Beaker, Gem, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { VariantCard } from "@/components/VariantCard";
import { ExportButtons } from "@/components/ExportButtons";
import { LatexRenderer } from "@/components/LatexRenderer";
import type { VariantResult, VariantTier } from "@/lib/types";
import { TIER_DESCRIPTIONS } from "@/lib/types";

interface OutputPanelProps {
  result: VariantResult | null;
  isLoading: boolean;
}

const TIER_CONFIG: {
  tier: VariantTier;
  label: string;
  icon: typeof FlaskConical;
}[] = [
  { tier: "bronze", label: "Bronze", icon: FlaskConical },
  { tier: "silver", label: "Silver", icon: Beaker },
  { tier: "gold", label: "Gold", icon: Gem },
];

export function OutputPanel({ result, isLoading }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<VariantTier>("bronze");

  if (isLoading) {
    return <LoadingState />;
  }

  if (!result) {
    return <EmptyState />;
  }

  const activeVariant = result.variants.find((v) => v.tier === activeTab);

  return (
    <div className="flex flex-col h-full">
      {/* Master analysis bar */}
      <div className="p-4 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">
            Question Analysis
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Subject: </span>
            <span className="text-foreground font-medium">
              {result.masterAnalysis.subject}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Model: </span>
            <span className="text-foreground font-medium">
              {result.masterAnalysis.model}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Variables: </span>
            <span className="text-foreground font-medium">
              {result.masterAnalysis.keyVariables.join(", ")}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Formula: </span>
            <LatexRenderer
              content={`$${result.masterAnalysis.formula}$`}
              className="inline text-foreground font-medium"
            />
          </div>
        </div>
      </div>

      {/* Tier tabs */}
      <div className="flex border-b border-border">
        {TIER_CONFIG.map(({ tier, label, icon: Icon }) => (
          <button
            key={tier}
            onClick={() => setActiveTab(tier)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-colors",
              activeTab === tier
                ? `tier-tab-${tier}`
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tier description */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-muted-foreground italic">
          {TIER_DESCRIPTIONS[activeTab]}
        </p>
      </div>

      {/* Variant content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {activeVariant && (
          <VariantCard key={activeVariant.tier} variant={activeVariant} />
        )}

        <ExportButtons result={result} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
        <Gem className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        Ready to Generate
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Enter an economics exam question on the left and click{" "}
        <strong>Generate Variants</strong> to create Bronze, Silver, and Gold
        difficulty versions with complete solutions.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        {TIER_CONFIG.map(({ tier, label, icon: Icon }) => (
          <div key={tier} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                tier === "bronze" && "bg-bronze-muted",
                tier === "silver" && "bg-silver-muted",
                tier === "gold" && "bg-gold-muted"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  tier === "bronze" && "text-bronze",
                  tier === "silver" && "text-silver",
                  tier === "gold" && "text-gold"
                )}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-5"
      >
        <Gem className="w-7 h-7 text-accent" />
      </motion.div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        Generating Variants…
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Analyzing your question, creating three difficulty tiers, and solving
        each variant step-by-step.
      </p>
      <div className="mt-6 flex gap-2">
        {["Analyzing", "Generating", "Solving"].map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            className="px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground"
          >
            {label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
