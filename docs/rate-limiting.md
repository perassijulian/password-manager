# 🧠 Auth Security: Rate Limiting & User Enumeration Protection

This document outlines the anti-abuse and privacy-first measures implemented in our login and signup flows. We focus on protecting our API from brute-force attacks and user enumeration, while giving users a smooth experience and developers clear debugging tools.

⸻

## 🚨 What is User Enumeration?

User Enumeration happens when an attacker can discover if a user exists in the system based on API responses.

Example:
• Signup returns: "Email already registered" → attacker confirms the email exists.
• Login returns: "Invalid password" vs "Email not found" → attacker learns which emails are valid.

Even small differences in timing, status codes, or messages can leak information.

⸻

## ✅ How We Prevented Enumeration

### 🔐 Sign Up

During sign up, we always return a 201 Created response — regardless of whether the email already exists.

```ts
return NextResponse.json({ success: true }, { status: 201 });
```

If the user does not exist, we:
• Create the user
• Send a verification email (TODO implementation)

If the user already exists, we:
• Do not reveal it
• Optionally send a reminder email instead (TODO implementation)

**Why?**
This way, attackers can’t tell if an email is registered or not — but users still receive appropriate follow-up in their inbox.

⸻

### 🔐 Login

When a user logs in, we return the same 401 Unauthorized error whether:
• The email is invalid
• The password is wrong

```ts
if (!user || !(await argon2.verify(user.password, password))) {
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
```

**Why?**
No way for an attacker to know if the email exists or not.

⸻

## 🚧 Rate Limiting

We have two layers of rate limiting:

🛡️ IP Rate Limit (Global Abuse Prevention)

We use Upstash Redis with a fixed window strategy:

```ts
Ratelimit.fixedWindow(5, "1 m");
```

This limits all requests per IP to 5 per minute.

Used in both signup and login.

⸻

### 📧 Login Fail Limit (Per Email+IP)

To block brute-force password guessing across accounts, we track failed login attempts by a combination of email and IP:

```ts
const key = `login:fail:${email}_${ip}`;
```

    •	On each failed login attempt, we increment the Redis key.
    •	On first fail, we EXPIRE the key after 5 minutes.
    •	After 5 failed attempts, we return:

```ts
return NextResponse.json(
  { error: "Too many requests, please try again later." },
  { status: 429 }
);
```

If login is successful, we call resetLoginFailLimit() to clear the counter.

**Why this key structure?**
It prevents a known user’s account from being locked out by a stranger across the internet (email-only based lockouts). Pairing with IP adds friction for targeted attacks without frustrating the legit user too quickly.

⸻

## ⚙️ Error Handling: What We Show vs Log

We never expose raw errors to the user — even rate limit or DB issues.

Instead, we:
• Return generic messages ("Too many requests", "Server error").
• Log technical errors in the server console:

```ts
console.error("Login error:", error);
```

**Why?**
Attackers get no extra info, but developers still see logs for debugging.

## ✅ Conclusion

By combining global IP rate limiting, per-user+IP login throttling, and consistent error responses, we’ve created a secure, privacy-first authentication system that’s resistant to brute-force attacks and user enumeration. Users get a smooth experience, attackers get nothing useful, and developers keep clear visibility through server logs.
