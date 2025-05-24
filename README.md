🔐 Notes on Password Security (after reading [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html))

After reviewing the OWASP Password Storage Cheat Sheet, I refreshed several key concepts related to secure password handling:

- Hashing vs Encryption: Passwords should be hashed, not encrypted. Hashing is a one-way function and cannot be reversed, which makes it safer for password storage. Encryption is reversible and should not be used for storing passwords.
- Salting: A salt is random data added to each password before hashing. This prevents attackers from using precomputed hash tables (rainbow tables) and makes offline brute-force attacks much harder.
- Peppering: A pepper is a secret value added to the password before hashing, but unlike a salt, it’s not stored in the database. This adds another layer of security, especially if the database is compromised.
- Work Factor: This refers to the number of iterations a hashing algorithm performs. Increasing the work factor makes each hash computation slower, which greatly reduces the effectiveness of brute-force attacks.
- bcrypt vs Argon2: While bcrypt is still widely used and supported, it’s considered a legacy option in 2025. When possible, prefer modern algorithms like Argon2id or scrypt, which offer better resistance against GPU-based attacks and are more tunable for memory and CPU usage.
