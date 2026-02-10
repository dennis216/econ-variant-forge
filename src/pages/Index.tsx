import { useState } from "react";
import { Header } from "@/components/Header";
import { InputPanel } from "@/components/InputPanel";
import { ExtractReviewPanel } from "@/components/ExtractReviewPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { useVariantGeneration } from "@/hooks/useVariantGeneration";

const Index = () => {
  const [rawText, setRawText] = useState("");
  const {
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
  } = useVariantGeneration();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />

      <main className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left panel: Stage 1 input or review */}
        <aside className="w-full lg:w-[38%] xl:w-[35%] border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          {stage === "input" && (
            <InputPanel
              value={rawText}
              onChange={setRawText}
              onExtract={() => extractVariables(rawText)}
              isLoading={isLoading}
              error={error}
            />
          )}
          {(stage === "review" || stage === "results") && extractedData && (
            <ExtractReviewPanel
              data={extractedData}
              onChange={setExtractedData}
              onConfirm={generateFromExtracted}
              onBack={() => {
                if (stage === "results") {
                  backToReview();
                } else {
                  reset();
                }
              }}
              isLoading={isLoading}
            />
          )}
        </aside>

        {/* Right panel: Output */}
        <section className="flex-1 overflow-y-auto">
          <OutputPanel result={result} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
};

export default Index;
