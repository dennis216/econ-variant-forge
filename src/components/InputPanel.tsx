import { Sparkles, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXAMPLE_QUESTIONS } from "@/lib/types";

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
}

export function InputPanel({
  value,
  onChange,
  onGenerate,
  isLoading,
  error,
}: InputPanelProps) {
  return (
    <div className="flex flex-col h-full p-6">
      {/* Section heading */}
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Master Question
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your economics exam question. LaTeX notation (
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">
            $...$
          </code>
          ) is supported.
        </p>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[180px] lg:min-h-0 p-4 rounded-lg border border-input bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/60 transition-shadow"
        placeholder={`e.g., In a closed economy, the consumption function is C = 200 + 0.75Y, planned investment I = 150, and government spending G = 100.\n\nCalculate the equilibrium level of GDP using the Keynesian Cross model.`}
      />

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Generate button */}
      <Button
        onClick={onGenerate}
        disabled={isLoading || !value.trim()}
        className="mt-4 h-11 font-semibold gap-2"
        size="lg"
      >
        <Sparkles className="w-4 h-4" />
        {isLoading ? "Generating Variants…" : "Generate Variants"}
      </Button>

      {/* Example questions */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Example Questions
          </h3>
        </div>
        <div className="space-y-2">
          {EXAMPLE_QUESTIONS.map((ex, i) => (
            <button
              key={i}
              onClick={() => onChange(ex.text)}
              className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-secondary/60 transition-colors group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {ex.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
