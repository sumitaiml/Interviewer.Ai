import express from "express";
import { PreInterviewBody } from "./types";
import { scrapeGithub } from "./scrapers/github";
import cors from "cors";
import { prisma } from "./db";
import { calculateResult } from "./result";
import { generateFirstQuestion, generateNextQuestion } from "./interviewer";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

app.post("/api/v1/pre-interview", async (req, res) => { 
    const { success, data } = PreInterviewBody.safeParse(req.body) ;

    if (!success) {
        res.status(411).json({
            message: "Incorrect body"
        });
        return 
    }

    // TODO: URL can be very malformed, probably use an SLM here?
    const githubUrl = data.github.endsWith("/") ? data.github.slice(0, -1) : data.github;

    const githubUsername = githubUrl.split("/").pop()!;

    const githubData = await scrapeGithub(githubUsername);

    const interview = await prisma.interview.create({
        data: {
            githubMetadata: JSON.stringify(githubData),
            status: "Pre"
        }
    })

    res.json({ id: interview.id });
})

app.post("/api/v1/session/start/:interviewId", async (req, res) => {
    const { interviewId } = req.params;

    try {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { conversations: true }
        });

        if (!interview) {
            res.status(404).json({ message: "Interview not found" });
            return;
        }

        const firstAssistantMsg = interview.conversations.find(c => c.type === "Assistant");
        if (firstAssistantMsg) {
            res.json({ message: firstAssistantMsg.message });
            return;
        }

        const githubMetadata = interview.githubMetadata as string;
        const firstQuestion = await generateFirstQuestion(githubMetadata);

        await prisma.message.create({
            data: {
                interviewId,
                type: "Assistant",
                message: firstQuestion
            }
        });

        await prisma.interview.update({
            where: { id: interviewId },
            data: { status: "InProgress" }
        });

        res.json({ message: firstQuestion });
    } catch (error) {
        console.error("Error starting session:", error);
        res.status(500).json({ error: "Failed to start interview session" });
    }
});

app.post("/api/v1/session/chat/:interviewId", async (req, res) => {
    const { interviewId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
        res.status(400).json({ error: "Message content is required" });
        return;
    }

    try {
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { conversations: true }
        });

        if (!interview) {
            res.status(404).json({ message: "Interview not found" });
            return;
        }

        await prisma.message.create({
            data: {
                interviewId,
                type: "User",
                message: message.trim()
            }
        });

        const updatedInterview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: {
                conversations: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        const history = updatedInterview?.conversations || [];
        const githubMetadata = interview.githubMetadata as string;

        const nextQuestion = await generateNextQuestion(githubMetadata, history);

        await prisma.message.create({
            data: {
                interviewId,
                type: "Assistant",
                message: nextQuestion
            }
        });

        res.json({ message: nextQuestion });
    } catch (error) {
        console.error("Error generating next question:", error);
        res.status(500).json({ error: "Failed to process chat response" });
    }
});

app.get("/api/v1/result/:interviewId", async (req, res) => {
  const interview = await prisma.interview.findFirst({
    where: {
      id: req.params.interviewId
    },
    include: {
      conversations: true
    }
  })

  if (!interview) {
    res.status(411).json({
      message: "Interview not found"
    })
    return 
  }

  res.json({
    score: interview?.score,
    feedback: interview?.feedback,
    transcript: interview?.conversations.map(c => ({
      type: c.type,
      content: c.message,
      createdAt: c.createdAt
    })),
    status: interview.status
  })

  // TODO: Should add some sort of a lock here.
  if (interview.status != "Done") {
    const result = await calculateResult(interview.conversations)

    await prisma.interview.update({
      where: {
        id: req.params.interviewId
      },
      data: {
        status: "Done",
        feedback: result.feedback,
        score: result.score
      }
    })
  }
})
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
