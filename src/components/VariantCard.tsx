import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LatexRenderer } from "@/components/LatexRenderer";
import type { Variant, VariantTier } from "@/lib/types";

interface VariantCardProps {
  variant: Variant;
}

export function VariantCard({ variant }: VariantCardProps) {
  const [showSolution, setShowSolution] = useState(false);

  const tierClass = `variant-border-${variant.tier}` as const;
  const chipClass = `change-chip-${variant.tier}` as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`bg-card rounded-lg border border-border shadow-sm ${tierClass} overflow-hidden`}
    >
      {/* Question header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
            {variant.title}
          </h3>
          <TierBadge tier={variant.tier} />
        </div>

        {/* Question body */}
        <div className="text-sm leading-relaxed">
          <LatexRenderer content={variant.question} />
        </div>

        {/* Changes */}
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Changes Applied
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {variant.changes.map((change, i) => (
              <span
                key={i}
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${chipClass}`}
              >
                {change}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Solution toggle */}
      <div className="border-t border-border">
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full flex items-center gap-2 px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
        >
          {showSolution ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>Step-by-Step Solution</span>
          <span className="ml-auto text-xs opacity-60">
            {variant.solution.steps.length} steps
          </span>
        </button>

        <AnimatePresence>
          {showSolution && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4">
                {variant.solution.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="pl-4 border-l-2 border-border"
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {step.stepNumber}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {step.description}
                      </span>
                    </div>
                    <div className="ml-7 space-y-1">
                      <LatexRenderer
                        content={`$$${step.formula}$$`}
                        className="text-sm"
                      />
                      <LatexRenderer
                        content={`$$${step.calculation}$$`}
                        className="text-sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        → {step.result}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Final answer */}
                <div className="mt-4 p-4 rounded-lg bg-secondary/60 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                      Final Answer
                    </span>
                  </div>
                  <LatexRenderer
                    content={variant.solution.finalAnswer}
                    className="text-sm font-medium"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TierBadge({ tier }: { tier: VariantTier }) {
  return <span className={`tier-badge tier-badge-${tier}`}>{tier}</span>;
}
