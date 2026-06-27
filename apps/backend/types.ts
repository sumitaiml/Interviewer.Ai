import z from "zod";

export const PreInterviewBody = z.object({
    github: z.string(),
    userId: z.string().nullable().optional(),
    userEmail: z.string().nullable().optional()
})