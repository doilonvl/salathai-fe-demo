"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, RefreshCcw, Search } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Locale } from "@/types/content";
import type { Blog, BlogStatus } from "@/types/blog";
import { fetchAdminBlogs, type AdminApiError } from "@/lib/api/blogs.admin";
import { formatDate, resolveI18nValue } from "@/lib/blogs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BlogEditor from "@/components/admin/blogs/BlogEditor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LIMIT = 10;
const STATUS_LABELS: Record<BlogStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};
const STATUS_STYLES: Record<BlogStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  scheduled: "bg-amber-100 text-amber-800 border-amber-200",
  archived: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "Request failed";
  const err = error as AdminApiError;
  if (err.payload && typeof err.payload === "string") return err.payload;
  if (err.payload && typeof err.payload === "object") {
    const payload = err.payload as Record<string, unknown>;
    if (typeof payload.message === "string") return payload.message;
    if (typeof payload.error === "string") return payload.error;
  }
  return err.message || "Request failed";
}

export default function AdminBlogsPage() {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "vi") as Locale;

  const [items, setItems] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [pendingQuery, setPendingQuery] = useState("");
  const [status, setStatus] = useState<"all" | BlogStatus>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [activeBlogId, setActiveBlogId] = useState<string | undefined>(
    undefined
  );

  const openCreate = () => {
    setEditorMode("create");
    setActiveBlogId(undefined);
    setEditorOpen(true);
  };

  const openEdit = (id: string) => {
    setEditorMode("edit");
    setActiveBlogId(id);
    setEditorOpen(true);
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchAdminBlogs({
      page,
      limit: LIMIT,
      sort: "-updatedAt",
      q: query || undefined,
      status: status === "all" ? undefined : status,
      signal: controller.signal,
    })
      .then((data) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        if ((err as Error).name === "AbortError") return;
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [page, query, status, refreshSeed]);

  const pageCount = Math.max(1, Math.ceil(total / LIMIT));
  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  const rows = useMemo(
    () =>
      items.map((item) => {
        const title = resolveI18nValue(item.title_i18n, locale, "Untitled");
        const slug = item.slug || resolveI18nValue(item.slug_i18n, locale, "-");
        const updatedAt = formatDate(
          item.updatedAt || item.publishedAt || item.createdAt,
          locale
        );
        const statusKey = item.status || "draft";
        return { item, title, slug, updatedAt, statusKey };
      }),
    [items, locale]
  );

  return (
    <Dialog.Root
      open={editorOpen}
      onOpenChange={(open) => {
        setEditorOpen(open);
        if (!open) {
          setActiveBlogId(undefined);
          setRefreshSeed((value) => value + 1);
        }
      }}
    >
      <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Blogs</h1>
          <p className="text-sm text-muted-foreground">
            Manage blog posts, drafts, and schedules.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setRefreshSeed((value) => value + 1)}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New blog
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Input
              value={pendingQuery}
              onChange={(event) => setPendingQuery(event.target.value)}
              placeholder="Search title, slug, tag..."
              className="min-w-[220px] flex-1"
            />
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                setQuery(pendingQuery.trim());
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status</span>
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as "all" | BlogStatus);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ item, title, slug, updatedAt, statusKey }) => (
              <TableRow key={item._id}>
                <TableCell className="max-w-[320px] truncate font-medium">
                  {title}
                </TableCell>
                <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground">
                  {slug}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      STATUS_STYLES[statusKey]
                    }`}
                  >
                    {STATUS_LABELS[statusKey]}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {updatedAt || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(item._id)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {loading ? (
          <div className="border-t px-4 py-3 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : null}
        {error ? (
          <div className="border-t px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {!loading && !error && items.length === 0 ? (
          <div className="border-t px-4 py-6 text-sm text-muted-foreground">
            No blogs found.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            Page {page} / {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={!hasPrev || loading}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={!hasNext || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,1200px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <Dialog.Title className="text-lg font-semibold text-neutral-900">
              {editorMode === "create" ? "New blog" : "Edit blog"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </Dialog.Close>
          </div>
          <div className="max-h-[85vh] overflow-y-auto px-5 py-4">
            <BlogEditor
              mode={editorMode}
              blogId={activeBlogId}
              embedded
              onCreated={() => setRefreshSeed((value) => value + 1)}
              onCancel={() => setEditorOpen(false)}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
