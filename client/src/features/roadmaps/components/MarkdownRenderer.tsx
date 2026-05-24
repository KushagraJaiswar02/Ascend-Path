import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content = '' }) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeBlockLang = '';
    let listItems: string[] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 my-3 space-y-1.5 text-body-xs text-muted-foreground leading-relaxed font-semibold">
            {listItems.map((item, idx) => (
              <li key={`li-${idx}`}>{parseInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const parseInlineMarkdown = (inlineText: string) => {
      let parts: React.ReactNode[] = [inlineText];
      
      // 1. Parse bold (**text**)
      parts = parts.flatMap((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const subParts = part.split(/\*\*([^*]+)\*\*/g);
        return subParts.map((sub, sIdx) => 
          sIdx % 2 === 1 ? <strong key={`b-${pIdx}-${sIdx}`} className="font-extrabold text-foreground">{sub}</strong> : sub
        );
      });

      // 2. Parse inline code (`code`)
      parts = parts.flatMap((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const subParts = part.split(/`([^`]+)`/g);
        return subParts.map((sub, sIdx) => 
          sIdx % 2 === 1 ? <code key={`code-${pIdx}-${sIdx}`} className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-bold font-mono text-primary border border-border/60">{sub}</code> : sub
        );
      });

      // 3. Parse links ([label](url))
      parts = parts.flatMap((part, pIdx) => {
        if (typeof part !== 'string') return part;
        const subParts = part.split(/\[([^\]]+)\]\(([^)]+)\)/g);
        const result: React.ReactNode[] = [];
        for (let i = 0; i < subParts.length; i++) {
          if (i % 3 === 0) {
            result.push(subParts[i]);
          } else if (i % 3 === 1) {
            const label = subParts[i];
            const url = subParts[i + 1] || '#';
            result.push(
              <a 
                key={`a-${pIdx}-${i}`} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
              >
                {label}
              </a>
            );
            i++; // skip url part
          }
        }
        return result;
      });

      return parts;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks handler (```language)
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          const codeString = codeBlockLines.join('\n');
          const currentLang = codeBlockLang;
          elements.push(
            <div key={`codeblock-${i}`} className="my-4 rounded-xl border border-border bg-slate-950 p-4 font-mono text-[11px] text-slate-100 shadow-md relative overflow-hidden select-text group">
              {currentLang && (
                <div className="absolute top-2 right-3 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 select-none">
                  {currentLang}
                </div>
              )}
              <pre className="overflow-x-auto whitespace-pre leading-relaxed select-text pr-10">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          // Opening code block
          flushList(`section-before-code-${i}`);
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim() || 'code';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // Headers (### or ##)
      if (line.startsWith('### ')) {
        flushList(`section-h3-${i}`);
        elements.push(
          <h4 key={`h3-${i}`} className="text-body-xs font-black text-foreground tracking-tight pt-3.5 pb-1 select-none border-l-2 border-primary/40 pl-2">
            {parseInlineMarkdown(line.slice(4))}
          </h4>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        flushList(`section-h2-${i}`);
        elements.push(
          <h3 key={`h2-${i}`} className="text-body-sm font-black text-foreground tracking-tight pt-5 pb-1.5 select-none">
            {parseInlineMarkdown(line.slice(3))}
          </h3>
        );
        continue;
      }

      // Blockquotes (> text)
      if (line.startsWith('> ')) {
        flushList(`section-bq-${i}`);
        elements.push(
          <blockquote key={`bq-${i}`} className="p-3.5 bg-muted/30 border-l-3 border-border/80 rounded-r-2xl my-3 text-[11px] text-muted-foreground font-semibold italic leading-relaxed">
            {parseInlineMarkdown(line.slice(2))}
          </blockquote>
        );
        continue;
      }

      // Lists (- item)
      if (line.startsWith('- ')) {
        listItems.push(line.slice(2));
        continue;
      }

      // Blank line
      if (line.trim() === '') {
        flushList(`section-blank-${i}`);
        continue;
      }

      // Normal paragraph
      flushList(`section-para-${i}`);
      elements.push(
        <p key={`p-${i}`} className="text-body-xs text-muted-foreground leading-relaxed font-semibold my-2.5 max-w-3xl select-text">
          {parseInlineMarkdown(line)}
        </p>
      );
    }

    // Flush any leftover list items
    flushList('final-leftover');

    return elements;
  };

  return <div className="space-y-1">{parseMarkdown(content)}</div>;
};
