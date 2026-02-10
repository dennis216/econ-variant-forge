import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VariantResult, VariantTier } from "@/lib/types";
import { TIER_LABELS } from "@/lib/types";

interface ExportButtonsProps {
  result: VariantResult;
}

function generateMarkdown(result: VariantResult): string {
  const lines: string[] = [];

  lines.push("# Economics Exam Variants");
  lines.push("");
  lines.push(`**Subject:** ${result.masterAnalysis.subject}`);
  lines.push(`**Model:** ${result.masterAnalysis.model}`);
  lines.push(
    `**Key Variables:** ${result.masterAnalysis.keyVariables.join(", ")}`
  );
  lines.push(`**Primary Formula:** $${result.masterAnalysis.formula}$`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const variant of result.variants) {
    const tierLabel = TIER_LABELS[variant.tier as VariantTier] || variant.tier;
    lines.push(`## ${tierLabel}: ${variant.title}`);
    lines.push("");
    lines.push("### Question");
    lines.push("");
    lines.push(variant.question);
    lines.push("");
    lines.push("### Changes Applied");
    lines.push("");
    for (const change of variant.changes) {
      lines.push(`- ${change}`);
    }
    lines.push("");
    lines.push("### Solution");
    lines.push("");
    for (const step of variant.solution.steps) {
      lines.push(
        `**Step ${step.stepNumber}: ${step.description}**`
      );
      lines.push("");
      lines.push(`$$${step.formula}$$`);
      lines.push("");
      lines.push(`$$${step.calculation}$$`);
      lines.push("");
      lines.push(`→ ${step.result}`);
      lines.push("");
    }
    lines.push("### Final Answer");
    lines.push("");
    lines.push(variant.solution.finalAnswer);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

async function exportPdf(result: VariantResult) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  // Create a temporary container with the content rendered as plain text
  const container = document.createElement("div");
  container.style.cssText =
    "position:absolute;left:-9999px;top:0;width:800px;padding:40px;background:white;color:#1a1a2e;font-family:Georgia,serif;font-size:14px;line-height:1.6;";

  let html = `<h1 style="font-size:24px;margin-bottom:8px;color:#1a1a2e;">Economics Exam Variants</h1>`;
  html += `<p style="font-size:12px;color:#666;margin-bottom:24px;">${result.masterAnalysis.subject} · ${result.masterAnalysis.model}</p>`;

  for (const variant of result.variants) {
    const tierLabel = TIER_LABELS[variant.tier as VariantTier] || variant.tier;
    html += `<div style="margin-bottom:32px;border-left:3px solid ${
      variant.tier === "bronze"
        ? "#b5651d"
        : variant.tier === "silver"
        ? "#8a8a8a"
        : "#d4a017"
    };padding-left:16px;">`;
    html += `<h2 style="font-size:18px;margin-bottom:8px;">${tierLabel}: ${variant.title}</h2>`;
    html += `<div style="margin-bottom:12px;">${variant.question.replace(
      /\n/g,
      "<br>"
    )}</div>`;
    html += `<p style="font-size:11px;color:#888;margin-bottom:8px;"><strong>Changes:</strong> ${variant.changes.join(
      " · "
    )}</p>`;
    html += `<h3 style="font-size:14px;margin:12px 0 8px;">Solution</h3>`;
    for (const step of variant.solution.steps) {
      html += `<p style="margin-bottom:4px;"><strong>Step ${step.stepNumber}:</strong> ${step.description}</p>`;
      html += `<p style="margin-left:16px;font-style:italic;margin-bottom:8px;">${step.formula} → ${step.calculation} → ${step.result}</p>`;
    }
    html += `<div style="background:#f5f0e8;padding:12px;border-radius:6px;margin-top:8px;"><strong>Final Answer:</strong> ${variant.solution.finalAnswer}</div>`;
    html += `</div>`;
  }

  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    while (heightLeft > 0) {
      pdf.addPage();
      position = 10 - (imgHeight - heightLeft);
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    pdf.save("economics-variants.pdf");
  } finally {
    document.body.removeChild(container);
  }
}

function downloadMarkdown(result: VariantResult) {
  const md = generateMarkdown(result);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "economics-variants.md";
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ result }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-3 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportPdf(result)}
        className="gap-2"
      >
        <Download className="w-3.5 h-3.5" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadMarkdown(result)}
        className="gap-2"
      >
        <FileText className="w-3.5 h-3.5" />
        Export Markdown
      </Button>
    </div>
  );
}
