import React from "react";

/**
 * Parses inline formatting tags (bold, italic, code, links) using a stable string scanner.
 */
export function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];
  const parts: React.ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    // 1. Hyperlink matcher: [label](url)
    if (text[index] === "[") {
      const closingBracket = text.indexOf("]", index);
      if (closingBracket !== -1 && text[closingBracket + 1] === "(") {
        const closingParen = text.indexOf(")", closingBracket + 1);
        if (closingParen !== -1) {
          const label = text.slice(index + 1, closingBracket);
          const url = text.slice(closingBracket + 2, closingParen);
          parts.push(
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D39E00] hover:text-[#B59300] underline font-semibold transition-colors duration-200 cursor-pointer"
            >
              {label}
            </a>
          );
          index = closingParen + 1;
          continue;
        }
      }
    }

    // 2. Strong/Bold matcher: **text** or __text__
    if (
      (text[index] === "*" && text[index + 1] === "*") ||
      (text[index] === "_" && text[index + 1] === "_")
    ) {
      const delim = text[index] === "*" ? "**" : "__";
      const closing = text.indexOf(delim, index + 2);
      if (closing !== -1) {
        const content = text.slice(index + 2, closing);
        parts.push(
          <strong key={index} className="font-bold text-gray-900">
            {content}
          </strong>
        );
        index = closing + 2;
        continue;
      }
    }

    // 3. Emphasis/Italic matcher: *text* or _text_
    if (text[index] === "*" || text[index] === "_") {
      const delim = text[index];
      const closing = text.indexOf(delim, index + 1);
      if (closing !== -1) {
        const content = text.slice(index + 1, closing);
        parts.push(
          <em key={index} className="italic text-gray-800">
            {content}
          </em>
        );
        index = closing + 1;
        continue;
      }
    }

    // 4. Inline Code matcher: `code`
    if (text[index] === "`") {
      const closing = text.indexOf("`", index + 1);
      if (closing !== -1) {
        const content = text.slice(index + 1, closing);
        parts.push(
          <code key={index} className="bg-gray-100 border border-gray-250 text-amber-800 font-mono text-[11px] px-1 py-0.5 rounded">
            {content}
          </code>
        );
        index = closing + 1;
        continue;
      }
    }

    // 5. Append character as plain text
    const lastPart = parts[parts.length - 1];
    if (typeof lastPart === "string") {
      parts[parts.length - 1] = lastPart + text[index];
    } else {
      parts.push(text[index]);
    }
    index++;
  }

  return parts;
}

/**
 * Transforms raw text containing double-newlines and bullet lists/numerical sequences into formatted React blocks.
 */
export function renderRichText(text: string): React.ReactNode {
  if (!text) return null;

  const normalized = text.replace(/\r\n/g, "\n");
  const blocks = normalized.split(/\n{2,}/);

  return (
    <div className="space-y-3.5 text-gray-650 tracking-normal antialiased">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const lines = trimmed.split("\n");

        // Detect if all lines in block represent list bullets
        const isBulletList = lines.every((line) => /^\s*[-*+]\s+/.test(line));
        const isNumberedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="list-disc pl-5 space-y-1.5 my-2.5">
              {lines.map((line, lIdx) => {
                const content = line.replace(/^\s*[-*+]\s+/, "");
                return (
                  <li key={lIdx} className="leading-relaxed hover:text-gray-900 transition-colors duration-150">
                    {parseInline(content)}
                  </li>
                );
              })}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={bIdx} className="list-decimal pl-5 space-y-1.5 my-2.5">
              {lines.map((line, lIdx) => {
                const content = line.replace(/^\s*\d+\.\s+/, "");
                return (
                  <li key={lIdx} className="leading-relaxed hover:text-gray-900 transition-colors duration-150">
                    {parseInline(content)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph with soft single-line carriage breaks preserved
        const elements = lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {parseInline(line)}
          </React.Fragment>
        ));

        return (
          <p key={bIdx} className="leading-relaxed font-sans text-xs">
            {elements}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Converts basic Markdown-like tokens to safe, typed inline styling for printing.
 * Keeps structural positioning intact for HTML-to-PDF engine generation.
 */
export function markdownToHtml(text: string): string {
  if (!text) return "";

  const xmlEscape = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  const parseInlineHtml = (t: string): string => {
    let html = xmlEscape(t);

    // Hyperlinks
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #D6AD00; text-decoration: underline; font-weight: 600;">$1</a>'
    );

    // Bold tags
    html = html.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

    // Italic tags
    html = html.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

    // Code spans
    html = html.replace(
      /`([^`]+)`/g,
      '<code style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #B45309;">$1</code>'
    );

    return html;
  };

  const normalized = text.replace(/\r\n/g, "\n");
  const blocks = normalized.split(/\n{2,}/);

  const htmlBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";

    const lines = trimmed.split("\n");
    const isBulletList = lines.every((line) => /^\s*[-*+]\s+/.test(line));
    const isNumberedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));

    if (isBulletList) {
      const listItemsHtml = lines
        .map((line) => {
          const content = line.replace(/^\s*[-*+]\s+/, "");
          return `<li style="margin-bottom: 5px; line-height: 1.5; font-size: 11px;">${parseInlineHtml(content)}</li>`;
        })
        .join("");
      return `<ul style="list-style-type: disc; padding-left: 20px; margin-top: 8px; margin-bottom: 8px;">${listItemsHtml}</ul>`;
    }

    if (isNumberedList) {
      const listItemsHtml = lines
        .map((line) => {
          const content = line.replace(/^\s*\d+\.\s+/, "");
          return `<li style="margin-bottom: 5px; line-height: 1.5; font-size: 11px;">${parseInlineHtml(content)}</li>`;
        })
        .join("");
      return `<ol style="list-style-type: decimal; padding-left: 20px; margin-top: 8px; margin-bottom: 8px;">${listItemsHtml}</ol>`;
    }

    const compiledLines = lines.map((line) => parseInlineHtml(line)).join("<br />");
    return `<p style="margin-top: 6px; margin-bottom: 6px; line-height: 1.5; font-size: 11px; color: #4A5568;">${compiledLines}</p>`;
  });

  return htmlBlocks.filter(Boolean).join("\n");
}
