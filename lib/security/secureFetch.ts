export const secureFetch = async (
  url: string,
  options: RequestInit = {},
  deviceId?: string
) => {
  const csrf = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
  const headers = {
    "Content-Type": "application/json",
    "x-csrf-token": csrf || "",
    ...(deviceId && { "x-device-id": deviceId }),
    ...options.headers,
  };
  return await fetch(url, {
    ...options,
    headers,
  });
};
