# 🔐 Notes on Password Security (after reading [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html))

After reviewing the OWASP Password Storage Cheat Sheet, I refreshed several key concepts related to secure password handling:

- Hashing vs Encryption: Passwords should be hashed, not encrypted. Hashing is a one-way function and cannot be reversed, which makes it safer for password storage. Encryption is reversible and should not be used for storing passwords.
- Salting: A salt is random data added to each password before hashing. This prevents attackers from using precomputed hash tables (rainbow tables) and makes offline brute-force attacks much harder.
- Peppering: A pepper is a secret value added to the password before hashing, but unlike a salt, it’s not stored in the database. This adds another layer of security, especially if the database is compromised.
- Work Factor: This refers to the number of iterations a hashing algorithm performs. Increasing the work factor makes each hash computation slower, which greatly reduces the effectiveness of brute-force attacks.
- bcrypt vs Argon2: While bcrypt is still widely used and supported, it’s considered a legacy option in 2025. When possible, prefer modern algorithms like Argon2id or scrypt, which offer better resistance against GPU-based attacks and are more tunable for memory and CPU usage.

# After reading the [Next.js Middleware documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware), I clarified what middleware really does:

- Middleware runs before a request is completed, allowing you to:
- Modify request or response headers
- Redirect users based on request conditions (e.g., A/B tests, geolocation, auth)
- Rewrite URLs dynamically
- Respond directly without reaching a route handler

✅ Ideal Use Cases:

- Redirecting unauthenticated users
- Implementing feature flags or experiments (A/B testing)
- Applying custom headers globally or for route groups

❌ Not Ideal For:

- Slow data fetching
- Session or authentication management that requires database lookups or JWT decoding
  Middleware should stay fast and lightweight, since it runs on every matching request.

🧠 Final Thought on Middleware and Auth

Although our middleware verifies JWT tokens to protect specific routes, this is still considered a lightweight and appropriate use of middleware in Next.js. We’re simply reading a cookie and verifying its signature — no database lookups or slow operations involved.

According to the Next.js Middleware documentation, middleware is not suited for full session management, such as fetching user data or decoding complex tokens. For those tasks, it’s better to use server-side functions like getServerSideProps, API routes, or server components.

In our case, middleware is used responsibly:

- ✅ Fast, stateless JWT check
- ✅ Route protection and redirect logic
- ❌ No DB reads or heavy computations

This approach ensures good performance while keeping protected areas secure.

# 🔐 Insights from [OWASP API Security](https://owasp.org/www-project-api-security/) Top 10 (2023)

After reading the first two points of the OWASP API Security Project, here are the key takeaways:

1. [Broken Object Level Authorization (BOLA)](https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/)

- BOLA is a common and easy-to-exploit vulnerability where attackers manipulate object IDs in API requests (e.g., user IDs or resource IDs).
- The server executes the action without properly verifying that the requester owns or has access to the resource.
- To prevent this, APIs must enforce object-level authorization checks, such as extracting the authenticated user’s ID from the JWT token and validating access accordingly.

2. [Broken Authentication](https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/)

- Authentication mechanisms are high-risk targets since they are exposed to all users.
- Best practices include:
- Re-authentication for sensitive operations (e.g., password changes, deleting data)
- Using established standards for password storage, authentication, and token handling
- Avoiding custom or untested implementations
- Important reminder: OAuth is an authorization framework, not an authentication method. Understand the distinction before implementing auth flows.

These points serve as a strong reminder that secure-by-design principles are essential when building authentication and authorization logic in APIs.
