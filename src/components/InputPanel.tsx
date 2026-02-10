import { useState, useRef } from "react";
import {
  Sparkles,
  AlertCircle,
  Lightbulb,
  FileSearch,
  Upload,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXAMPLE_QUESTIONS } from "@/lib/types";

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onExtract: () => void;
  isLoading: boolean;
  error: string | null;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n\n");
}

export function InputPanel({
  value,
  onChange,
  onExtract,
  isLoading,
  error,
}: InputPanelProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showSanitized, setShowSanitized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setParseError("Please upload a PDF file.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setParseError("File must be under 20 MB.");
      return;
    }

    setUploadedFile(file);
    setParseError(null);
    setIsParsing(true);
    setShowSanitized(false);

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        setParseError("No text could be extracted. The PDF may be image-based or empty.");
        setIsParsing(false);
        return;
      }
      onChange(text);
      setShowSanitized(true);
    } catch (err) {
      console.error("PDF parse error:", err);
      setParseError("Failed to parse PDF. Try pasting the text manually.");
    } finally {
      setIsParsing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setShowSanitized(false);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayError = error || parseError;

  return (
    <div className="flex flex-col h-full p-6">
      {/* Stage indicator */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
          1
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Paste or Upload Question
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Paste text or upload a PDF. The AI will extract variables and context.
          </p>
        </div>
      </div>

      {/* PDF Upload zone */}
      <div className="mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-upload"
        />
        {!uploadedFile ? (
          <label
            htmlFor="pdf-upload"
            className="flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed border-border bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors group"
          >
            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Upload PDF
            </span>
            <span className="text-xs text-muted-foreground/60">
              (max 20 MB)
            </span>
          </label>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/40">
            <FileText className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024).toFixed(1)} KB
                {isParsing && " · Extracting text…"}
              </p>
            </div>
            {isParsing ? (
              <Loader2 className="w-4 h-4 text-accent animate-spin shrink-0" />
            ) : (
              <button
                onClick={clearFile}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          or paste text
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Sanitized preview or raw textarea */}
      {showSanitized ? (
        <div className="flex-1 min-h-[180px] lg:min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">
              Sanitized Text Preview
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Review the extracted text. Fix any garbled symbols (Δ, ε, Σ) or numbers before proceeding.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 p-4 rounded-lg border border-accent/30 bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 font-mono text-sm leading-relaxed transition-shadow"
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-h-[180px] lg:min-h-0 p-4 rounded-lg border border-input bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/60 transition-shadow"
          placeholder={`Paste your raw exam text here...\n\ne.g., In a closed economy, the consumption function is C = 200 + 0.75Y, planned investment I = 150, and government spending G = 100.`}
        />
      )}

      {/* Error message */}
      {displayError && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{displayError}</p>
        </div>
      )}

      {/* Extract button */}
      <Button
        onClick={onExtract}
        disabled={isLoading || isParsing || !value.trim()}
        className="mt-4 h-11 font-semibold gap-2"
        size="lg"
      >
        <FileSearch className="w-4 h-4" />
        {isLoading ? "Extracting Data…" : "Extract Data"}
      </Button>

      {/* Example questions */}
      {!showSanitized && (
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
      )}
    </div>
  );
}
