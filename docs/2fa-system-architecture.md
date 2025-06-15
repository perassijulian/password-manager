# 🔐 2FA System Design Reflection

**Problem:** Designing a Modern, Reusable Two-Factor Authentication Flow

One of the more nuanced challenges in this project was designing a flexible and secure 2FA system that could support multiple verification contexts without locking the user into rigid flows or duplicating logic.

The most common use case is verifying the user during login — but as the app grew, I also wanted to require 2FA for sensitive actions like copying a stored password. This meant the system needed to support:

1. **Flow-based verification:** Traditional full-page 2FA after login.
2. **Context-based verification:** Lightweight inline/modal 2FA for specific user actions.

I wanted a system that was secure, reusable, and didn't require separate implementations for each use case.

⸻

## 🧱 Initial Setup

The original flow was simple and effective:

- `/2fa/verify`: A dedicated client-rendered page
- `/api/2fa/verify`: An endpoint that accepted the 6-digit code

This worked well for login — but reusing it for in-context 2FA (e.g., confirming identity before showing a password) started to feel clunky. Redirecting users away from their current action just to verify a code wasn’t ideal UX.

⸻

## 💥 The Growing Pain

As I started implementing password copy protection, some issues emerged:

- Full-page redirection interrupted the user’s flow
- I didn’t want to duplicate the entire 2FA form just to use it in a modal
- There was no context-awareness — the backend couldn’t distinguish between 2FA for login vs. 2FA for a sensitive action

It was functional, but not scalable.

⸻

## ✅ The Refactor

To address this, I restructured the 2FA system with these goals:

- ✅ **Modular frontend**: One `TwoFAVerification` component that can be reused in any context (full page or inline)
- ✅ **Context-aware backend**: A unified endpoint that can verify 2FA codes for specific "challenges" (e.g., `login`, `copy_password`)
- ✅ **Flexible UX**: Modal-based verification for sensitive actions, preserving user context

### 🧩 TwoFAVerification Component

I extracted the form UI into a reusable component:

```tsx
<TwoFAVerification onSuccess={handleSecureAction} reason="copy_password" />
```

This let me embed the form wherever needed — without repeating form logic or validation. It supports customizable messages and success handlers.

## 🛡️ Backend Challenge Verification

I modified the backend to accept a reason or challenge parameter:

```ts
POST /api/2fa/verify
Body: { code: "123456", reason: "copy_password" }
```

Then scoped the verification check based on the action:
• For login: ensures a valid session is established
• For password copy: verifies the code and creates a short-lived token to allow the action

All challenges are logged and time-bound to prevent abuse.

## 🖼️ UX Upgrade

For context-sensitive actions, I show the 2FA form inline or in a modal — avoiding redirection:

```ts
if (!userHasVerified2FA) {
  return res.status(403).json({ twoFARequired: true });
}
```

The frontend can then show the modal and retry the original action once verification succeeds.

⸻

## 📐 Benefits of the New Flow

✅ Security-focused: All sensitive actions require explicit re-verification
✅ Minimal duplication: Same 2FA logic reused across the app
✅ User-friendly: Avoids jarring navigation changes during inline actions
✅ Extendable: Easy to add new challenges like delete_account, change_email, etc.

⸻

## 🤓 Technical Highlights

    •	react-hook-form + zod for clean validation
    •	Query params and context props used to maintain UX consistency across flows
    •	Verification tokens scoped to specific actions and expire after use
    •	Shared component pattern for better DX and testability

⸻

## 🚀 Reflection

This refactor taught me how to design systems that are modular, secure, and UX-conscious. It was a small part of the app, but its architecture mattered — both for security and for how users experience trust.

It also reinforced how important it is to think about scalability early, even for things that seem like “just one form.”

Designing this helped me grow my confidence in building production-grade security flows that balance frontend freedom and backend control — a valuable mindset for any full-stack or product engineer.
