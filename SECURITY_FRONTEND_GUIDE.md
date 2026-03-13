# Frontend Security Guide - Salathai

Backend da duoc cap nhat bao mat. Frontend can thuc hien cac thay doi sau de dam bao an toan toan he thong.

---

## 1. XSS Protection - Sanitize Blog Content (CRITICAL)

Backend luu blog content dang rich document (JSON). Frontend **bat buoc** phai sanitize truoc khi render HTML.

```bash
npm install dompurify
npm install -D @types/dompurify
```

```tsx
import DOMPurify from "dompurify";

// Khi render blog content tu API
function BlogContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "b", "i", "em", "strong", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "img", "br", "blockquote", "code", "pre"],
    ALLOWED_ATTR: ["href", "src", "alt", "class"],
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

**Khong bao gio** dung `dangerouslySetInnerHTML` truc tiep voi data tu API ma khong sanitize.

---

## 2. CSRF Protection

Backend su dung cookie httpOnly cho JWT. Frontend can:

- Dam bao moi request POST/PUT/DELETE gui kem header `Content-Type: application/json`
- Su dung `credentials: "include"` trong fetch/axios de gui cookie

```tsx
// axios config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
```

---

## 3. Error Handling - Khong hien thi raw error cho user

Backend trong production chi tra ve `"Internal Server Error"`. Frontend can:

```tsx
try {
  const res = await api.post("/auth/login", data);
} catch (err: any) {
  // Hien thi message chung, khong hien thi raw error
  const msg = err?.response?.data?.message || "Co loi xay ra, vui long thu lai";
  toast.error(msg);
}
```

**Khong** log `err.response` ra console trong production — co the chua thong tin nhay cam.

---

## 4. Rate Limiting - Xu ly 429 Status

Backend da them rate limiting:
- **Global**: 300 req / 15 phut (production)
- **Login**: 10 lan / 15 phut

Frontend can xu ly:

```tsx
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 429) {
      toast.error("Ban dang gui qua nhieu yeu cau. Vui long doi mot lat.");
      return Promise.reject(err);
    }
    return Promise.reject(err);
  }
);
```

---

## 5. Input Validation - Validate TRUOC khi gui API

Khong phu thuoc hoan toan vao backend validation. Frontend can validate:

```tsx
// Dung zod hoac yup
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z.string().min(6, "Mat khau toi thieu 6 ky tu"),
});

const reservationSchema = z.object({
  fullName: z.string().min(2).max(100),
  phoneNumber: z.string().regex(/^[0-9+\-\s()]{7,20}$/, "So dien thoai khong hop le"),
  email: z.string().email().optional(),
  guests: z.number().min(1).max(50),
  reservationDate: z.string().refine((d) => new Date(d) > new Date(), "Ngay phai o tuong lai"),
});
```

---

## 6. Pagination - Gioi han limit

Backend gioi han limit toi da 100. Frontend nen:

```tsx
// Khong cho user nhap limit > 100
const PAGE_SIZE = 20; // mac dinh
const MAX_PAGE_SIZE = 100;

function fetchProducts(page: number, limit: number = PAGE_SIZE) {
  const safeLimit = Math.min(limit, MAX_PAGE_SIZE);
  return api.get(`/products?page=${page}&limit=${safeLimit}`);
}
```

---

## 7. Search Input - Khong gui ky tu dac biet

Backend da escape regex, nhung frontend nen gioi han:

```tsx
function sanitizeSearch(q: string): string {
  return q.replace(/[^\p{L}\p{N}\s\-]/gu, "").trim().slice(0, 100);
}

// Su dung
const safeQuery = sanitizeSearch(searchInput);
api.get(`/products?q=${encodeURIComponent(safeQuery)}`);
```

---

## 8. File Upload - Validate truoc khi upload

```tsx
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (giong backend)

function validateFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Chi chap nhan file anh (JPG, PNG, WebP, GIF)";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File qua lon (toi da 20MB)";
  }
  return null; // OK
}
```

---

## 9. Environment Variables - Khong lo secret

Frontend **KHONG DUOC** chua:
- API keys (Cloudinary, SMTP, etc.)
- JWT secrets
- Database URIs

Chi duoc chua:
- `NEXT_PUBLIC_API_URL` (URL cua backend)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (chi cloud name, khong phai API key)

```env
# .env.local (frontend)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## 10. Authentication Flow

```
Login -> Backend set httpOnly cookie -> Frontend khong can luu token
Refresh -> Backend tu dong refresh qua cookie
Logout -> Backend xoa cookie
```

Frontend **KHONG** luu JWT vao localStorage hoac sessionStorage. Cookie httpOnly tu dong duoc gui theo moi request.

```tsx
// Check auth status
async function checkAuth() {
  try {
    const { data } = await api.get("/auth/me");
    return data; // user info
  } catch {
    return null; // chua dang nhap
  }
}
```

---

## 11. CORS - Frontend URL phai duoc whitelist

Backend yeu cau `CORS_ORIGINS` trong production. Dam bao URL cua frontend duoc them vao backend `.env`:

```env
# Backend .env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Neu gap loi CORS, lien he backend team de them origin.

---

## Tom tat thay doi Backend da thuc hien

| # | Thay doi | Muc do |
|---|---------|--------|
| 1 | JWT secrets bat buoc trong production | CRITICAL |
| 2 | Xoa log thong tin SMTP nhay cam | CRITICAL |
| 3 | MongoDB Docker co xac thuc | CRITICAL |
| 4 | Error handler an stack trace trong production | HIGH |
| 5 | Rate limiting toan cuc (300 req/15min) | HIGH |
| 6 | Rate limiting login (10 req/15min) | HIGH |
| 7 | CORS chan tat ca origin neu khong config trong production | HIGH |
| 8 | Helmet voi Content Security Policy | HIGH |
| 9 | Escape regex trong search (chong ReDoS) | MEDIUM |
| 10 | Gioi han pagination (max 100 items) | MEDIUM |
| 11 | An MongoDB connection string trong error log | MEDIUM |
| 12 | Tang bcrypt salt rounds (10 -> 12) | LOW |
