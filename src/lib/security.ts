import DOMPurify from "dompurify";

// ---- XSS Protection: Sanitize HTML content ----

const ALLOWED_TAGS = [
  "p", "b", "i", "em", "strong", "a", "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "img", "br", "blockquote", "code", "pre",
];
const ALLOWED_ATTR = ["href", "src", "alt", "class"];

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

// ---- Search Input Sanitization ----

export function sanitizeSearch(q: string): string {
  return q.replace(/[^\p{L}\p{N}\s\-]/gu, "").trim().slice(0, 100);
}

// ---- File Upload Validation ----

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Chi chap nhan file anh (JPG, PNG, WebP, GIF)";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File qua lon (toi da 20MB)";
  }
  return null;
}

// ---- Pagination ----

export const PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function safeLimit(limit: number): number {
  return Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
}
