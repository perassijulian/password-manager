import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";
import { handleLogin2FA } from "@/handlers/2fa/handleLogin2FA";
import { handleSensitive2FA } from "@/handlers/2fa/handleSensitive2FA";
import { actionTypeEnum, contextTypeEnum } from "@/types";

const schema = z.object({
  code: z.string().length(6),
  deviceId: z.string(),
  context: contextTypeEnum,
  actionType: actionTypeEnum,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    return withRateLimit(req, async () => {
      // 2. Validate body
      const rawParams = await req.json();
      const parseResult = schema.safeParse(rawParams);
      if (!parseResult.success)
        return NextResponse.json(
          { error: "Invalid request parameters" },
          { status: 400 }
        );
      const { context, ...data } = parseResult.data;

      switch (context) {
        case "login":
          return handleLogin2FA(req, data);
        case "sensitive":
          return handleSensitive2FA(req, data);
        default:
          return NextResponse.json(
            { error: "Invalid context" },
            { status: 400 }
          );
      }
    });
  } catch (error) {
    console.error("Error in 2FA verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
