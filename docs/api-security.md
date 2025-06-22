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

# 🔐 Encryption Algorithm Choice

Based on the OWASP Cryptographic Storage Cheat Sheet, we have chosen AES (Advanced Encryption Standard) as the encryption algorithm for securely storing sensitive user data in our application.

Whenever possible, we will use AES in an authenticated encryption mode, such as AES-GCM or AES-CCM

If authenticated modes are not available due to platform or library limitations, we will fall back to AES-CTR or AES-CBC.

On the decision of the encryption algorithm we found an interesting improvement I detail in [why-reading-docs-is-important](./why-reading-docs-is-important.md)

# API Rate Limiting

## Introduction

After reading [What is API Rate Limiting?](https://datadome.co/bot-management-protection/what-is-api-rate-limiting/), I understand the importance of implementing rate limiting as a fundamental security and performance measure.

Rate limiting helps prevent request overflow, securing limited backend resources from misuse. Without it, malicious actors can exploit the system—whether by harvesting data, spamming endpoints, or launching Distributed Denial of Service (DDoS) attacks—which could prevent legitimate users from accessing the API.

A well-implemented rate limiting strategy makes the system more resilient. In some cases, it can be complemented by CAPTCHA or other bot detection mechanisms when abnormal traffic is detected.

## Key Takeaways from Zuplo's 10 Best Practices for API Rate Limiting (2025)

Reading [Zuplo’s blog post](https://zuplo.com/blog/2025/01/06/10-best-practices-for-api-rate-limiting-in-2025), these are the concepts that resonated the most:

- **Choose the Right Algorithm**  
  Different algorithms (e.g. Token Bucket, Leaky Bucket, Fixed Window Counter, Sliding Log) serve different needs. Picking the appropriate one depends on your specific use case.

- **Understand Your Clients**  
  Before defining your limits, you need to understand your users' behavior. Different user types might require different thresholds.

- **Use Caching to Reduce Load**  
  Implement caching strategies to minimize redundant API calls. This helps reduce strain on your backend and improves performance.

## Conclusion

There are many angles to consider when implementing rate limiting, from algorithms to user profiling and caching. However, for our use case, we’ll begin with a basic rate limit of **5 requests per minute** per user or IP. If the application grows and usage patterns become more complex, we’ll revisit and refine our strategy based on real user behavior and scaling needs.

# 2FA (Two-Factor Authentication)

When implementing 2FA, I found it surprisingly tricky to locate objective and straightforward resources. Many blogs and websites were biased, often pushing their own commercial solutions.

After exploring several options, the most consistently recommended package I came across was otplib. It stood out due to its:

- High number of GitHub stars and forks
- Strong contributor base
- Compatibility with apps like Google Authenticator

These factors led me to choose the following stack for my TOTP-based 2FA system:

- otplib – for generating and validating TOTP codes
- qrcode – to display a scannable QR code
- zod – to validate the inputs and enforce strong type safety

This setup allows users to scan a QR code with an authenticator app, and then input their 6-digit code to securely log in. It’s modern, lightweight, and developer-friendly.
