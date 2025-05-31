import { authenticator } from "otplib";
import qrcode from "qrcode";

export function generate2FASecret(userEmail: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(userEmail, "passwordManager", secret);
  return { secret, otpauth };
}

export async function generateQRCode(otpauth: string) {
  try {
    const qrCode = await qrcode.toDataURL(otpauth);
    return qrCode;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

export function verify2FA(secret: string, token: string) {
  return authenticator.verify({ token, secret });
}
