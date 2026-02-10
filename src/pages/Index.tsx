import { useState } from "react";
import { Header } from "@/components/Header";
import { InputPanel } from "@/components/InputPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { useVariantGeneration } from "@/hooks/useVariantGeneration";

const Index = () => {
  const [masterQuestion, setMasterQuestion] = useState("");
  const { result, isLoading, error, generate } = useVariantGeneration();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />

      <main className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Input panel */}
        <aside className="w-full lg:w-[38%] xl:w-[35%] border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          <InputPanel
            value={masterQuestion}
            onChange={setMasterQuestion}
            onGenerate={() => generate(masterQuestion)}
            isLoading={isLoading}
            error={error}
          />
        </aside>

        {/* Output panel */}
        <section className="flex-1 overflow-y-auto">
          <OutputPanel result={result} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
};

export default Index;
