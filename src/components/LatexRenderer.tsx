import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className }: LatexRendererProps) {
  return (
    <div className={cn("prose-variant text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
