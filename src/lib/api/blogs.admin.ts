/* eslint-disable @typescript-eslint/no-explicit-any */
import { getApiBaseUrl } from "@/lib/env";
import type { Blog, BlogListResponse, BlogUpsertPayload } from "@/types/blog";
import { refreshAccessToken } from "@/lib/auth";

const API_BASE_URL = getApiBaseUrl();

export type AdminApiError = Error & { status?: number; payload?: unknown };

function getClientToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function readErrorPayload(res: Response) {
  try {
    return await res.json();
  } catch {
    return await res.text();
  }
}

async function fetchAdminJson<T>(
  path: string,
  init?: RequestInit,
  retry = true
): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getClientToken();
  if (token && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const nextHeaders = new Headers(init?.headers);
      nextHeaders.set("authorization", `Bearer ${newToken}`);
      return fetchAdminJson<T>(path, { ...init, headers: nextHeaders }, false);
    }
  }

  if (!res.ok) {
    const error = new Error(
      `Admin blogs request failed: ${res.status}`
    ) as AdminApiError;
    error.status = res.status;
    error.payload = await readErrorPayload(res);
    throw error;
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}

export async function fetchAdminBlogs(params: {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
  q?: string;
  deleted?: boolean;
  signal?: AbortSignal;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.sort) query.set("sort", params.sort);
  if (params.q) query.set("q", params.q);
  if (typeof params.deleted === "boolean") {
    query.set("deleted", params.deleted ? "true" : "false");
  }
  const path = query.toString() ? `/blogs?${query.toString()}` : "/blogs";

  return fetchAdminJson<BlogListResponse>(path, {
    signal: params.signal,
  });
}

export async function fetchAdminBlogById(id: string) {
  return fetchAdminJson<Blog>(`/blogs/${id}`);
}

export async function createAdminBlog(payload: BlogUpsertPayload) {
  return fetchAdminJson<Blog>(`/blogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminBlog(
  id: string,
  patch: Partial<BlogUpsertPayload>
) {
  return fetchAdminJson<Blog>(`/blogs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export async function deleteAdminBlog(id: string) {
  return fetchAdminJson<{ success?: boolean }>(`/blogs/${id}`, {
    method: "DELETE",
  });
}

export async function publishAdminBlog(id: string) {
  return fetchAdminJson<Blog>(`/blogs/${id}/publish`, { method: "PATCH" });
}

export async function scheduleAdminBlog(id: string, scheduledAt: string) {
  return fetchAdminJson<Blog>(`/blogs/${id}/schedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scheduledAt }),
  });
}

export async function archiveAdminBlog(id: string) {
  return fetchAdminJson<Blog>(`/blogs/${id}/archive`, { method: "PATCH" });
}

type UploadImageResult = {
  url: string;
  secure_url?: string;
  public_id?: string;
  publicId?: string;
};

export async function uploadBlogImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchAdminJson<UploadImageResult>(`/upload/single?folder=blogs`, {
    method: "POST",
    body: formData,
  });
}

function normalizeUploadImagesResponse(payload: unknown): UploadImageResult[] {
  if (Array.isArray(payload)) {
    return payload as UploadImageResult[];
  }
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  const candidates =
    (data.items as unknown[]) ||
    (data.data as unknown[]) ||
    (data.results as unknown[]) ||
    (data.files as unknown[]) ||
    (data.images as unknown[]);
  if (Array.isArray(candidates)) {
    return candidates as UploadImageResult[];
  }
  const urls = data.urls as unknown;
  if (Array.isArray(urls)) {
    return urls
      .filter((value): value is string => typeof value === "string")
      .map((value) => ({ url: value }));
  }
  const url = data.secure_url || data.url;
  if (typeof url === "string") {
    return [{ url }];
  }
  return [];
}

export async function uploadBlogImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const payload = await fetchAdminJson<unknown>(`/upload/multi?folder=blogs`, {
    method: "POST",
    body: formData,
  });
  return normalizeUploadImagesResponse(payload);
}
