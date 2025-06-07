export default async function safeClipboardWrite(text: string) {
  if (!navigator.clipboard) return "unsupported";
  try {
    await navigator.clipboard.writeText(text);
    return "success";
  } catch (error) {
    console.error("Failed to write to clipboard:", error);
    return "error";
  }
}
