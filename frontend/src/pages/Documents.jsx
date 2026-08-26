import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function Documents() {
  const { accessToken } = useAuth();

  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getAuthHeaders = useCallback(() => {
    if (!accessToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }, [accessToken]);

  const loadDocuments = useCallback(async () => {
    if (!accessToken) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.get("/documents", {
        headers: getAuthHeaders(),
      });

      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to load documents."
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, getAuthHeaders]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUploadClick = () => {
    setError("");
    setSuccess("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!accessToken) {
      setError("You must be signed in to upload documents.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await authApi.post(
        "/documents/upload",
        formData,
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      setSuccess(
        response.data?.message ||
          "Document uploaded successfully."
      );

      await loadDocuments();
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to upload the document."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!documentId || deletingDocumentId) {
      return;
    }

    setDeletingDocumentId(documentId);
    setError("");
    setSuccess("");

    try {
      const response = await authApi.delete(
        `/documents/${documentId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document.id !== documentId
        )
      );

      setSuccess(
        response.data?.message ||
          "Document deleted successfully."
      );
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to delete the document."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${(
      bytes / Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "â€”";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "â€”";
    }

    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">
              AetherAI Knowledge
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Documents
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Upload and manage the organizational knowledge
              used by AetherAI for intelligent search and
              AI-powered answers.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadDocuments}
              disabled={isLoading || isUploading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Upload size={17} />
              )}

              {isUploading
                ? "Uploading..."
                : "Upload document"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{success}</span>
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Total documents
            </p>

            <p className="mt-2 text-2xl font-bold">
              {documents.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Processed
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {
                documents.filter(
                  (document) => document.is_processed
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-500">
              Processing
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-400">
              {
                documents.filter(
                  (document) => !document.is_processed
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 px-6 py-5">
            <h2 className="text-lg font-semibold">
              Knowledge sources
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Documents uploaded to your AetherAI workspace.
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading documents...
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-indigo-400">
                <FileText size={28} />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No documents yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Upload your first organizational document to
                start building your AetherAI knowledge base.
              </p>

              <button
                type="button"
                onClick={handleUploadClick}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-500"
              >
                <Upload size={17} />
                Upload your first document
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-indigo-400">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-100">
                        {document.original_filename ||
                          document.filename}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          {formatFileSize(
                            document.file_size
                          )}
                        </span>

                        <span>
                          {formatDate(document.created_at)}
                        </span>

                        <span>
                          {document.content_type ||
                            "Unknown type"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={
                        document.is_processed
                          ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                          : "rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400"
                      }
                    >
                      {document.is_processed
                        ? "Processed"
                        : "Processing"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(document.id)
                      }
                      disabled={
                        deletingDocumentId === document.id
                      }
                      aria-label={`Delete ${
                        document.original_filename ||
                        document.filename
                      }`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingDocumentId ===
                      document.id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-5">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <div>
              <p className="text-sm font-medium text-slate-200">
                Knowledge processing
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Uploaded documents are processed in the
                background and added to the AetherAI vector
                knowledge store when processing completes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;
