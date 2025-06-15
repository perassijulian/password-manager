# 📚 Why Reading Docs Is Important

During the decision-making process for our encryption strategy, we discovered a key improvement that highlights the value of reading official documentation—even in the age of AI assistance.

Initially, our encryption and decryption logic was scaffolded using AI and looked like this:

```bash
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

While this implementation uses AES with a 256-bit key (a solid foundation), after consulting the OWASP [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), we learned:

```text
Where available, authenticated modes should always be used. These provide guarantees of the integrity and authenticity of the data, as well as confidentiality. The most commonly used authenticated modes are GCM and CCM, which should be used as a first preference.

If GCM or CCM are not available, then CTR mode or CBC mode should be used. As these do not provide any guarantees about the authenticity of the data, separate authentication should be implemented, such as using the Encrypt-then-MAC technique. Care needs to be taken when using this method with variable length messages
```

This showed us that while AES-256-CBC is valid, it lacks built-in authentication, which introduces a potential security risk. We were not using any additional mechanism—like Encrypt-then-MAC—to ensure integrity. A better approach would be using AES in an authenticated mode such as GCM.

This insight underscores the importance of continuously reading official documentation and trusted resources—especially when it comes to security. AI is a powerful tool, but it should complement, not replace, deep understanding and validation from trusted sources.
