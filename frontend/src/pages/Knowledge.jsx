import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ragApi from "../api/ragApi";

function Knowledge() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || isSearching) {
      return;
    }

    setIsSearching(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const result = await ragApi.askRAG(
        trimmedQuery,
        5
      );

      setAnswer(result?.answer || "");
      setSources(result?.sources || []);
    } catch (requestError) {
      const detail =
        requestError?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item?.msg || "Invalid request"
            )
            .join(", ")
        );
      } else {
        setError(
          detail ||
            requestError?.message ||
            "Unable to search your knowledge base."
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-sm font-semibold">
                Knowledge
              </h1>

              <p className="text-xs text-slate-500">
                Search your uploaded documents
              </p>
            </div>
          </div>

          <Sparkles className="h-5 w-5 text-indigo-400" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
            <BookOpen className="h-7 w-7 text-indigo-400" />
          </div>

          <h2 className="mt-5 text-2xl font-semibold">
            Ask your knowledge base
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Ask questions about your uploaded
            documents. AetherAI will search your
            document knowledge and return relevant
            information with sources.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3"
        >
          <div className="flex items-end gap-3">
            <textarea
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  handleSearch(event);
                }
              }}
              rows={3}
              placeholder="Ask something about your uploaded documents..."
              disabled={isSearching}
              className="min-h-[76px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
            />

            <button
              type="submit"
              disabled={
                !query.trim() || isSearching
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Search knowledge"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>

          <p className="mt-2 px-2 text-xs text-slate-600">
            Enter your question and AetherAI will
            search the uploaded document knowledge.
          </p>
        </form>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {answer && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  AetherAI Knowledge Answer
                </h3>

                <p className="text-xs text-slate-600">
                  Based on your uploaded documents
                </p>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {answer}
            </p>

            {sources.length > 0 && (
              <div className="mt-6 border-t border-slate-800 pt-5">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sources
                </h4>

                <div className="space-y-2">
                  {sources.map(
                    (source, index) => (
                      <div
                        key={`${source.document_id}-${source.chunk_index}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                      >
                        <p className="text-xs font-medium text-slate-400">
                          Source {index + 1}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Document:{" "}
                          {source.document_id ||
                            "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Chunk:{" "}
                          {source.chunk_index ??
                            "Unknown"}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {!answer && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-800 px-6 py-12 text-center">
            <Search className="mx-auto h-6 w-6 text-slate-700" />

            <p className="mt-3 text-sm text-slate-600">
              Search your uploaded knowledge to
              see answers here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Knowledge;
