import {
  ArrowLeft,
  Bot,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

function Chat() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const [query, setQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken]
  );

  const loadConversations = useCallback(async () => {
    if (!accessToken) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversations`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to load conversations."
        );
      }

      setConversations(data?.conversations || []);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to load chat history."
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, [accessToken, authHeaders]);

  const loadMessages = useCallback(
    async (id) => {
      if (!accessToken || !id) {
        return;
      }

      setError("");
      setIsLoadingHistory(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/chat/conversations/${id}/messages`,
          {
            method: "GET",
            headers: authHeaders(),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load conversation."
          );
        }

        const loadedMessages = (
          data?.messages || []
        ).map((message) => ({
          id:
            message.message_id ||
            `${message.sender_type}-${message.created_at}`,
          sender_type: message.sender_type,
          message: message.message,
          sources: [],
        }));

        setConversationId(id);
        setMessages(loadedMessages);
        setSidebarOpen(false);
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to load conversation."
        );
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [accessToken, authHeaders]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const createConversation = async (
    title = "New AetherAI Conversation"
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/chat/conversations`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          "Unable to create conversation."
      );
    }

    setConversationId(data.conversation_id);

    setConversations((previous) => [
      {
        conversation_id: data.conversation_id,
        title: data.title,
        created_at: data.created_at,
      },
      ...previous,
    ]);

    return data.conversation_id;
  };

  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setQuery("");
    setError("");
    setSidebarOpen(false);
  };

  const sendMessage = async (event) => {
    event?.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || isLoading) {
      return;
    }

    if (!accessToken) {
      setError(
        "Authentication required. Please sign in again."
      );
      return;
    }

    setError("");
    setIsLoading(true);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender_type: "user",
      message: trimmedQuery,
      sources: [],
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuery("");

    try {
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        activeConversationId =
          await createConversation(
            trimmedQuery.slice(0, 80)
          );
      }

      const response = await fetch(
        `${API_BASE_URL}/chat/${activeConversationId}/message`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            query: trimmedQuery,
            top_k: 5,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to process your message."
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        sender_type: "assistant",
        message:
          data?.answer ||
          "I was unable to generate an answer.",
        sources: data?.sources || [],
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Something went wrong while contacting AetherAI."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (
    id,
    event
  ) => {
    event?.stopPropagation();

    if (!id || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this conversation permanently?"
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(id);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/chat/conversations/${id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to delete conversation."
        );
      }

      setConversations((previous) =>
        previous.filter(
          (conversation) =>
            conversation.conversation_id !== id
        )
      );

      if (conversationId === id) {
        startNewConversation();
      }
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to delete conversation."
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-sm font-semibold text-white">
                AetherAI
              </h1>

              <p className="text-xs text-slate-500">
                AI Knowledge & Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm text-slate-300 transition hover:border-indigo-500/30 hover:text-white lg:hidden"
            >
              <MessageSquare className="h-4 w-4" />
              History
            </button>

            <button
              type="button"
              onClick={startNewConversation}
              className="flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-slate-900 hover:text-white sm:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                New conversation
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-slate-800/80 lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Chat history
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Your conversations
                </p>
              </div>

              <button
                type="button"
                onClick={startNewConversation}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-indigo-500/30 hover:text-white"
                aria-label="New conversation"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="flex items-center gap-2 px-2 py-4 text-xs text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading history...
              </div>
            ) : conversations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-center">
                <MessageSquare className="mx-auto h-5 w-5 text-slate-700" />

                <p className="mt-2 text-xs text-slate-600">
                  No conversations yet.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map(
                  (conversation) => {
                    const active =
                      conversation.conversation_id ===
                      conversationId;

                    return (
                      <button
                        key={
                          conversation.conversation_id
                        }
                        type="button"
                        onClick={() =>
                          loadMessages(
                            conversation.conversation_id
                          )
                        }
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                          active
                            ? "bg-indigo-500/10 text-white ring-1 ring-indigo-500/20"
                            : "text-slate-400 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {conversation.title ||
                              "Untitled conversation"}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-600">
                            {formatDate(
                              conversation.created_at
                            )}
                          </p>
                        </div>

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) =>
                            deleteConversation(
                              conversation.conversation_id,
                              event
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              deleteConversation(
                                conversation.conversation_id,
                                event
                              );
                            }
                          }}
                          className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 group-hover:flex"
                          aria-label="Delete conversation"
                        >
                          {isDeleting ===
                          conversation.conversation_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              onClick={() =>
                setSidebarOpen(false)
              }
              aria-label="Close history"
            />

            <aside className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col border-r border-slate-800 bg-slate-950 p-4 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Chat history
                  </h2>

                  <p className="mt-1 text-xs text-slate-600">
                    Your conversations
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400"
                  aria-label="Close history"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={startNewConversation}
                className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                New conversation
              </button>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-slate-600">
                    No conversations yet.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {conversations.map(
                      (conversation) => (
                        <button
                          key={
                            conversation.conversation_id
                          }
                          type="button"
                          onClick={() =>
                            loadMessages(
                              conversation.conversation_id
                            )
                          }
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${
                            conversation.conversation_id ===
                            conversationId
                              ? "bg-indigo-500/10 text-white"
                              : "text-slate-400 hover:bg-slate-900 hover:text-white"
                          }`}
                        >
                          <MessageSquare className="h-4 w-4 shrink-0" />

                          <span className="min-w-0 flex-1 truncate text-sm">
                            {conversation.title ||
                              "Untitled conversation"}
                          </span>

                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) =>
                              deleteConversation(
                                conversation.conversation_id,
                                event
                              )
                            }
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-400"
                            aria-label="Delete conversation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* Main chat */}
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] min-w-0 max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
                <Bot className="h-6 w-6 text-indigo-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Ask AetherAI
                </h2>

                <p className="text-sm text-slate-500">
                  Ask questions about your
                  organizational knowledge.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            {isLoadingHistory &&
            messages.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading conversation...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-500/20">
                  <Bot className="h-8 w-8 text-indigo-400" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  How can I help you?
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Ask questions about your uploaded
                  documents and AetherAI will retrieve
                  relevant knowledge and generate an
                  answer.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "What is this document about?",
                    "Summarize the uploaded documents.",
                    "What skills are mentioned?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        setQuery(suggestion)
                      }
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400 transition hover:border-indigo-500/30 hover:text-indigo-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => {
                  const isUser =
                    message.sender_type ===
                    "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                          <Bot className="h-4 w-4 text-indigo-400" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          isUser
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-800 bg-slate-950 text-slate-200"
                        }`}
                      >
                        <div className="mb-1 text-xs font-medium opacity-60">
                          {isUser
                            ? user?.fullName ||
                              "You"
                            : "AetherAI"}
                        </div>

                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {message.message}
                        </p>

                        {!isUser &&
                          message.sources?.length >
                            0 && (
                            <div className="mt-4 border-t border-slate-800 pt-3">
                              <p className="mb-2 text-xs font-medium text-slate-500">
                                Sources
                              </p>

                              <div className="space-y-1">
                                {message.sources.map(
                                  (
                                    source,
                                    index
                                  ) => (
                                    <p
                                      key={`${source.document_id}-${index}`}
                                      className="text-xs text-slate-600"
                                    >
                                      Source{" "}
                                      {index + 1}{" "}
                                      Â· Chunk{" "}
                                      {
                                        source.chunk_index
                                      }
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                          <User className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                      <Bot className="h-4 w-4 text-indigo-400" />
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        AetherAI is thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={sendMessage}
            className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-3"
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
                    sendMessage(event);
                  }
                }}
                rows={2}
                placeholder="Ask AetherAI something..."
                disabled={isLoading}
                className="min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              />

              <button
                type="submit"
                disabled={
                  !query.trim() || isLoading
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="mt-2 px-2 text-xs text-slate-600">
              Press Enter to send Â· Shift + Enter
              for a new line
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default Chat;


