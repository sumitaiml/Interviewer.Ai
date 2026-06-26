import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `
You are an expert, friendly, and professional technical interviewer. Your goal is to interview the candidate based on their computer science intellect and their GitHub projects.

Guidelines:
1. Act as a live interviewer. Speak naturally, concisely, and conversationally.
2. Keep each response brief (1-3 sentences maximum). Since your response will be read aloud to the user, long paragraphs will feel unnatural and tedious.
3. Ask around 2-3 technical questions in total throughout the interview, digging deeper into their answers.
4. Base your questions on their GitHub repositories and technical experience.
5. Do not write code or give long explanations. Focus on asking the candidate questions.
6. Speak in English only.
`;

export async function generateFirstQuestion(githubMetadata: string): Promise<string> {
    const prompt = `
    ${SYSTEM_PROMPT}
    
    The candidate has started the interview. Here is their GitHub profile metadata:
    ${githubMetadata}
    
    Introduce yourself briefly, welcome them, and ask your first interview question based on their GitHub projects. Keep it very conversational and short.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text?.trim() || "Hello! Let's start the interview. Can you tell me about your favorite project on GitHub?";
}

export async function generateNextQuestion(
    githubMetadata: string,
    history: { type: "User" | "Assistant"; message: string }[]
): Promise<string> {
    // Format conversation history for Gemini
    const formattedHistory = history.map(msg => ({
        role: msg.type === "User" ? "user" : "model",
        parts: [{ text: msg.message }]
    }));

    // Append the system instructions and github context to the prompt
    const prompt = `
    ${SYSTEM_PROMPT}
    
    Candidate's GitHub Metadata:
    ${githubMetadata}
    
    Based on the conversation history above, respond naturally to the candidate and ask the next follow-up question.
    If you have asked 2-3 solid questions and feel the interview is complete, politely let the candidate know they can wrap up and click "End Interview" to see their feedback.
    
    Remember: Keep your response under 3 sentences and conversational.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            ...formattedHistory.map(h => ({ role: h.role, parts: h.parts })),
            { role: "user", parts: [{ text: prompt }] }
        ]
    });

    return response.text?.trim() || "Thank you. Could you elaborate on that?";
}
