import { z } from "zod";

export const codeFormSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Only numbers allowed"),
});
export type CodeFormData = z.infer<typeof codeFormSchema>;
