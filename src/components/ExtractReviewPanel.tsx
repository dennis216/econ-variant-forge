import { useState } from "react";
import { CheckCircle2, ArrowLeft, Pencil, Trash2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LatexRenderer } from "@/components/LatexRenderer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExtractedData, ExtractedVariable } from "@/lib/types";

interface ExtractReviewPanelProps {
  data: ExtractedData;
  onChange: (data: ExtractedData) => void;
  onConfirm: (data: ExtractedData) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function ExtractReviewPanel({
  data,
  onChange,
  onConfirm,
  onBack,
  isLoading,
}: ExtractReviewPanelProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const updateVariable = (idx: number, field: keyof ExtractedVariable, value: string) => {
    const updated = [...data.variables];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange({ ...data, variables: updated });
  };

  const removeVariable = (idx: number) => {
    onChange({ ...data, variables: data.variables.filter((_, i) => i !== idx) });
    if (editingIdx === idx) setEditingIdx(null);
  };

  const addVariable = () => {
    const newVar: ExtractedVariable = { name: "", symbol: "", value: "", unit: "" };
    onChange({ ...data, variables: [...data.variables, newVar] });
    setEditingIdx(data.variables.length);
  };

  const updateContext = (field: keyof typeof data.context, value: string) => {
    onChange({ ...data, context: { ...data.context, [field]: value } });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
            <h2 className="font-display text-lg font-semibold text-foreground">Review Extracted Data</h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground ml-[52px]">
          Verify and edit the extracted variables before generating variants.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Economic Context */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Economic Context
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["subject", "Subject"],
              ["model", "Model"],
              ["marketType", "Market Type"],
              ["country", "Country/Region"],
            ] as const).map(([field, label]) => (
              <div key={field}>
                <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                <Input
                  value={data.context[field]}
                  onChange={(e) => updateContext(field, e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Formula */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Primary Formula
          </h3>
          <Input
            value={data.formula}
            onChange={(e) => onChange({ ...data, formula: e.target.value })}
            className="font-mono text-sm h-9 mb-2"
          />
          <div className="p-2 rounded bg-secondary/50 border border-border">
            <LatexRenderer content={`$$${data.formula}$$`} className="text-sm" />
          </div>
        </section>

        {/* Question */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Question
          </h3>
          <textarea
            value={data.questionText}
            onChange={(e) => onChange({ ...data, questionText: e.target.value })}
            className="w-full p-3 rounded-lg border border-input bg-card text-foreground text-sm resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </section>

        {/* Variables table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Key Variables
            </h3>
            <Button variant="outline" size="sm" onClick={addVariable} className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40">
                  <TableHead className="text-xs w-[30%]">Variable</TableHead>
                  <TableHead className="text-xs w-[15%]">Symbol</TableHead>
                  <TableHead className="text-xs w-[20%]">Value</TableHead>
                  <TableHead className="text-xs w-[20%]">Unit</TableHead>
                  <TableHead className="text-xs w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.variables.map((v, idx) => (
                  <TableRow key={idx}>
                    {editingIdx === idx ? (
                      <>
                        <TableCell className="p-1.5">
                          <Input value={v.name} onChange={(e) => updateVariable(idx, "name", e.target.value)} className="h-8 text-xs" />
                        </TableCell>
                        <TableCell className="p-1.5">
                          <Input value={v.symbol} onChange={(e) => updateVariable(idx, "symbol", e.target.value)} className="h-8 text-xs font-mono" />
                        </TableCell>
                        <TableCell className="p-1.5">
                          <Input value={v.value} onChange={(e) => updateVariable(idx, "value", e.target.value)} className="h-8 text-xs font-mono" />
                        </TableCell>
                        <TableCell className="p-1.5">
                          <Input value={v.unit} onChange={(e) => updateVariable(idx, "unit", e.target.value)} className="h-8 text-xs" />
                        </TableCell>
                        <TableCell className="p-1.5 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setEditingIdx(null)} className="h-7 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-sm">{v.name}</TableCell>
                        <TableCell className="text-sm font-mono text-accent">${v.symbol}$</TableCell>
                        <TableCell className="text-sm font-mono font-semibold">{v.value}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{v.unit}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditingIdx(idx)} className="h-7 w-7 p-0">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeVariable(idx)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      {/* Confirm button */}
      <div className="p-5 border-t border-border bg-card">
        <Button
          onClick={() => onConfirm(data)}
          disabled={isLoading || data.variables.length === 0}
          className="w-full h-11 font-semibold gap-2"
          size="lg"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? "Generating Variants…" : "Confirm & Generate Variants"}
        </Button>
      </div>
    </div>
  );
}
