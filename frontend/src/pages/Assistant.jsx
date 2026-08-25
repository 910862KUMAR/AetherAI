import {
  ArrowLeft,
  Bot,
  Clock3,
  Loader2,
  Menu,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import assistantService from "../services/assistantService";
import { useAuth } from "../context/AuthContext";
import MarkdownMessage from "../components/assistant/MarkdownMessage";

function Assistant() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] =
    useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");

  const [isLoadingConversations, setIsLoadingConversations] =
    useState(true);
  const [isLoadingMessages, setIsLoadingMessages] =
    useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] =
    useState(false);
  const [deletingConversationId, setDeletingConversationId] =
    useState(null);

  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const userName =
    user?.fullName ||
    user?.full_name ||
    "You";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const normalizeMessage = (message) => ({
    id:
      message?.message_id ||
      message?.id ||
      `${Date.now()}-${Math.random()}`,
    role:
      message?.sender_type === "assistant"
        ? "assistant"
        : "user",
    content: message?.message || "",
  });

  const getErrorMessage = (
    requestError,
    fallback
  ) =>
    requestError?.response?.data?.detail ||
    requestError?.response?.data?.message ||
    requestError?.message ||
    fallback;

  const loadConversations = async () => {
    setIsLoadingConversations(true);

    try {
      const response = await api.get(
        "/assistant/conversations"
      );

      const items =
        response.data?.conversations || [];

      setConversations(items);

      setActiveConversationId((currentId) => {
        if (
          currentId &&
          items.some(
            (item) =>
              item.conversation_id === currentId
          )
        ) {
          return currentId;
        }

        return items[0]?.conversation_id || null;
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to load assistant conversations."
        )
      );
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    setError("");

    try {
      const response = await api.get(
        `/assistant/conversations/${conversationId}/messages`
      );

      const loadedMessages =
        response.data?.messages || [];

      setMessages(
        loadedMessages.map(normalizeMessage)
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to load conversation messages."
        )
      );

      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const createConversation = async () => {
    if (isCreatingConversation || isSending) {
      return null;
    }

    setIsCreatingConversation(true);
    setError("");

    try {
      const conversation =
        await assistantService.createConversation(
          "New conversation"
        );

      setConversations((current) => [
        conversation,
        ...current.filter(
          (item) =>
            item.conversation_id !==
            conversation.conversation_id
        ),
      ]);

      setActiveConversationId(
        conversation.conversation_id
      );

      setMessages([]);
      setQuery("");
      setShowHistory(false);

      return conversation;
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to create a new conversation."
        )
      );

      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleNewConversation = async () => {
    await createConversation();

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const selectConversation = (conversationId) => {
    if (
      conversationId === activeConversationId
    ) {
      setShowHistory(false);
      return;
    }

    if (isSending) {
      return;
    }

    setActiveConversationId(conversationId);
    setQuery("");
    setError("");
    setShowHistory(false);
  };

  const deleteConversation = async (
    conversationId,
    event
  ) => {
    event?.stopPropagation();

    if (
      !conversationId ||
      deletingConversationId ||
      isSending
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this conversation? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingConversationId(conversationId);
    setError("");

    try {
      await assistantService.deleteConversation(
        conversationId
      );

      const remaining =
        conversations.filter(
          (conversation) =>
            conversation.conversation_id !==
            conversationId
        );

      setConversations(remaining);

      if (
        activeConversationId ===
        conversationId
      ) {
        if (remaining.length > 0) {
          setActiveConversationId(
            remaining[0].conversation_id
          );
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to delete conversation."
        )
      );
    } finally {
      setDeletingConversationId(null);
    }
  };

  const sendMessage = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || isSending) {
      return;
    }

    setError("");
    setIsSending(true);

    let conversationId =
      activeConversationId;

    try {
      if (!conversationId) {
        const conversation =
          await createConversation();

        if (!conversation) {
          return;
        }

        conversationId =
          conversation.conversation_id;
      }

      const userMessage = {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmedQuery,
      };

      setMessages((current) => [
        ...current,
        userMessage,
      ]);

      setQuery("");

      const response =
        await assistantService.sendMessage(
          conversationId,
          trimmedQuery
        );

      const assistantAnswer =
        response?.answer || "";

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: assistantAnswer,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setActiveConversationId(
        conversationId
      );

      const conversationsResponse =
        await assistantService.getConversations();

      setConversations(
        conversationsResponse?.conversations || []
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to get a response from AetherAI."
        )
      );
    } finally {
      setIsSending(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = async (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      await sendMessage();
    }
  };

  const historyContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <div>
          <p className="text-sm font-semibold text-white">
            History
          </p>

          <p className="text-xs text-slate-500">
            Your conversations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close history"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoadingConversations ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <Clock3 className="mx-auto h-6 w-6 text-slate-700" />

            <p className="mt-3 text-xs leading-5 text-slate-600">
              No conversations yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(
              (conversation) => {
                const isActive =
                  conversation.conversation_id ===
                  activeConversationId;

                return (
                  <div
                    key={
                      conversation.conversation_id
                    }
                    className={`group flex items-center gap-2 rounded-xl ${
                      isActive
                        ? "bg-slate-800"
                        : "hover:bg-slate-900"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        selectConversation(
                          conversation.conversation_id
                        )
                      }
                      className="min-w-0 flex-1 px-3 py-3 text-left"
                    >
                      <p
                        className={`truncate text-sm ${
                          isActive
                            ? "font-medium text-white"
                            : "text-slate-400"
                        }`}
                      >
                        {conversation.title ||
                          "New conversation"}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-600">
                        {conversation.updated_at
                          ? new Date(
                              conversation.updated_at
                            ).toLocaleDateString()
                          : ""}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={(event) =>
                        deleteConversation(
                          conversation.conversation_id,
                          event
                        )
                      }
                      disabled={
                        deletingConversationId ===
                          conversation.conversation_id ||
                        isSending
                      }
                      className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
                      aria-label="Delete conversation"
                    >
                      {deletingConversationId ===
                      conversation.conversation_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 lg:block">
        {historyContent}
      </aside>

      {showHistory && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className="absolute inset-0 bg-black/60"
            aria-label="Close history"
          />

          <aside className="relative z-10 h-full w-80 max-w-[85vw] border-r border-slate-800 bg-slate-950 shadow-2xl">
            {historyContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowHistory(true)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white lg:hidden"
                aria-label="Open conversation history"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    AetherAI
                  </p>

                  <p className="text-xs text-slate-500">
                    General AI Assistant
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewConversation}
              disabled={
                isCreatingConversation ||
                isSending
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingConversation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                New conversation
              </span>
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6">
            <section className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                  <Bot className="h-6 w-6 text-indigo-400" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    AI Assistant
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Your general-purpose AetherAI
                    assistant.
                  </p>
                </div>
              </div>
            </section>

            <section className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {isLoadingMessages ? (
                  <div className="flex min-h-[430px] items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading conversation...
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex min-h-[430px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                      <Sparkles className="h-8 w-8 text-indigo-400" />
                    </div>

                    <h2 className="mt-6 text-xl font-semibold text-white">
                      How can I help you?
                    </h2>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      Ask me about programming, Java,
                      Python, system design, AI,
                      debugging, writing, explanations,
                      or any general topic.
                    </p>

                    <p className="mt-4 text-xs text-slate-600">
                      General AI only. Uploaded
                      documents are not searched here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => {
                      const isUser =
                        message.role === "user";

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
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                              <Bot className="h-4 w-4 text-indigo-400" />
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                              isUser
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-800 bg-slate-950 text-slate-200"
                            }`}
                          >
                            <div className="mb-1 text-xs font-medium opacity-60">
                              {isUser
                                ? userName
                                : "AetherAI"}
                            </div>

                            {isUser ? (
                              <div className="whitespace-pre-wrap break-words">
                                {message.content}
                              </div>
                            ) : (
                              <MarkdownMessage
                                content={message.content}
                              />
                            )}
                          </div>

                          {isUser && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
                              <User className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {error && (
                <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-3 sm:px-6">
                  <div
                    role="alert"
                    className="text-sm text-red-300"
                  >
                    {error}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800 bg-slate-950/80 p-4 sm:p-5">
                <form
                  onSubmit={handleSubmit}
                  className="relative"
                >
                  <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    disabled={
                      isSending ||
                      isLoadingMessages
                    }
                    rows={3}
                    maxLength={5000}
                    placeholder="Ask AetherAI anything..."
                    className="min-h-[110px] w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 pr-16 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="submit"
                    disabled={
                      isSending ||
                      isLoadingMessages ||
                      !query.trim()
                    }
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between px-1">
                  <p className="text-xs text-slate-600">
                    Enter to send Â· Shift + Enter for
                    a new line
                  </p>

                  <p className="text-xs text-slate-700">
                    {query.length}/5000
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Assistant;
