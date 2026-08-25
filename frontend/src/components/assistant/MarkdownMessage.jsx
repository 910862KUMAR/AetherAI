import { Check, Copy } from "lucide-react";
import { Children, isValidElement, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function extractText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(extractText).join("");
  }

  if (isValidElement(value)) {
    return extractText(value.props?.children);
  }

  return "";
}

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);

  const code = extractText(children).replace(/\n$/, "");

  const language =
    className?.match(/language-([\w-]+)/)?.[1] || "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2">
        <span className="text-xs font-medium text-slate-500">
          {language}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code className={className || ""}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function MarkdownMessage({ content = "" }) {
  return (
    <div className="markdown-message break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-2xl font-bold text-white first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-xl font-bold text-white first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-lg font-semibold text-white first:mt-0">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="mb-3 leading-7 text-slate-300 last:mb-0">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-6 text-slate-300">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-6 text-slate-300">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="leading-7">
              {children}
            </li>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-indigo-500/50 bg-slate-900/70 px-4 py-3 text-slate-400">
              {children}
            </blockquote>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline decoration-indigo-400/40 underline-offset-2 hover:text-indigo-300"
            >
              {children}
            </a>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic text-slate-200">
              {children}
            </em>
          ),

          hr: () => (
            <hr className="my-5 border-slate-800" />
          ),

          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-slate-900 text-left text-slate-200">
              {children}
            </thead>
          ),

          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800">
              {children}
            </tbody>
          ),

          tr: ({ children }) => (
            <tr className="divide-x divide-slate-800">
              {children}
            </tr>
          ),

          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="px-4 py-3 text-slate-300">
              {children}
            </td>
          ),

          code: ({
            children,
            className,
            ...props
          }) => {
            const isInline =
              !className &&
              !extractText(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="rounded-md bg-slate-800 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-300"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className={className || ""}
                {...props}
              >
                {children}
              </code>
            );
          },

          pre: ({ children }) => {
            const codeElement =
              Children.toArray(children)[0];

            if (!isValidElement(codeElement)) {
              return (
                <pre className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-[#0d1117] p-4">
                  {children}
                </pre>
              );
            }

            const codeClassName =
              codeElement.props?.className || "";

            const codeChildren =
              codeElement.props?.children;

            return (
              <CodeBlock
                className={codeClassName}
              >
                {codeChildren}
              </CodeBlock>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownMessage;
