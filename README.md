# 🔐 password-manager — lightweight Modern Password Manager with 2FA

Password-manager is a full-stack password manager built with modern technologies and security best practices. It features encrypted credentials storage, TOTP-based 2FA, rate limiting, password strength analysis, and a clean, responsive UI.

This is not just a CRUD app — it’s an exploration of **real-world security design**, **Next.js 15+**, and **developer-first UX**.

---

## ✨ Features

- 🔑 **Secure Auth Flow** — JWT-based sessions with HttpOnly cookies
- 🔒 **Argon2 Hashing** — Industry-standard password hashing (with salt + optional pepper)
- 🔐 **2FA (TOTP)** — Compatible with Google Authenticator, built using `otplib` + `qrcode`
- 📈 **Password Strength** — Zxcvbn integration for real-time strength feedback
- 🚦 **Rate Limiting** — Upstash Redis-backed rate limiting with abuse protection
- 🧩 **Form Validation** — `zod` + `react-hook-form` for type-safe UX
- 🌒 **Dark Mode** — Accessible and theme-aware interface
- 🧪 **Security Best Practices** — Secure cookies, clean separation of concerns

---

## 🖼️ Screenshots

- TODO

---

## 🛠️ Tech Stack

| Layer         | Technology                                                             |
| ------------- | ---------------------------------------------------------------------- |
| Frontend      | Next.js 15, React 19, TailwindCSS, Radix UI, Lucide Icons              |
| Backend       | Next.js App Router + API routes, NextAuth (custom adapter), Prisma ORM |
| Auth & Crypto | JWT, Argon2, otplib, qrcode, jsonwebtoken                              |
| Rate Limiting | Upstash Redis (`@upstash/ratelimit`)                                   |
| Forms         | React Hook Form, Zod                                                   |
| UX & UI       | Tailwind Merge, clsx, dark mode toggle                                 |
| Deployment    | Vercel (TODO)                                                          |

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/perassijulian/password-manager
cd password-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Rename .env.example to .env and configure:

```js
JWT_SECRET= ...
ENCRYPTION_KEY= ...
UPSTASH_REDIS_REST_URL= ...
UPSTASH_REDIS_REST_TOKEN= ...
RESEND_API_KEY= ...
```

### 4. Run Dev Server

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

## 📁 Docs & Internal Notes

Find deep dives, implementation notes, and references in the /docs folder:

- [2fa-system-architecture.md](./docs/2fa-system-architecture.md)
- [api-security.md](./docs/api-security.md)
- [middleware-auth.md](./docs/middleware-auth.md)
- [password-storage.md](./docs/password-storage.md)
- [rate-limiting.md](./docs/rate-limiting.md)
- [why-reading-docs-is-important.md](./docs/why-reading-docs-is-important.md)

⸻

## 🧠 Project Goals & Learning Outcomes

This project is both a portfolio and a personal sandbox to understand:

- The balance between security and developer experience
- Why 2FA is harder than it looks
- How to write readable, testable, and type-safe code in modern fullstack apps
- Production-grade auth flows without relying fully on prebuilt solutions

⸻

## 🚧 Roadmap / Future Improvements

- 🔐 Enhance 2FA Coverage — Require two-factor re-authentication for sensitive actions (e.g., password changes, deleting entries).
- 🕵️‍♂️ Action Logging & Auditing — Track and log critical operations (e.g., login attempts, vault modifications) for auditing and anomaly detection.
- 🧪 Automated Testing — Implement unit and integration tests to ensure reliability and security during development.
- 🛡️ Security-First CI/CD — Add a hardened CI/CD pipeline with secret scanning, dependency checks, static analysis, and security gates on deploy.

⸻

## 📜 License

MIT License — feel free to use, fork, or learn from it.

⸻

Made with 🧠, ☕, and zero tolerance for weak passwords.
