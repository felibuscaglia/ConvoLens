import { App } from "@slack/bolt";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { isQuestion } from "../utils/validators";
import { databaseService } from "../services/databaseService";
import { embeddingService } from "../services/embeddingService";
import openaiClient from "../services/openaiClient";

export default function registerAsk(app: App) {
  app.command("/ask", async ({ ack, body, respond }) => {
    await ack();
    const text = body.text;
    const channelId = body.channel_id;

    if (!isQuestion(text)) {
      return respond({
        text: "Please enter a valid question.",
        response_type: "ephemeral",
      });
    }

    // Check if channel is synced
    const channel = await databaseService.getChannel(channelId);

    if (!channel?.is_synced) {
      return respond({
        text: "⚠️ ConvoLens hasn't finished syncing this channel yet. Run /activate first.",
        response_type: "ephemeral",
      });
    }

    try {
      // Generate embedding for the question
      const questionEmbedding = await embeddingService.generateEmbedding(text);

      // Find relevant messages using similarity search
      const relevantMessages = await databaseService.searchMessagesBySimilarity(
        channelId,
        questionEmbedding,
        10 // TODO: Define top K
      );

      // Create context from relevant messages
      const context = relevantMessages
        .map((msg) => `${msg.username}: ${msg.text}`)
        .join("\n");

      console.log({ relevantMessages, context });

      const prompt: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `Answer questions based on the provided Slack conversation context.`,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${text}`,
        },
      ];

      const result = await openaiClient.chat.completions.create({
        model: "o4-mini",
        messages: prompt,
      });

      await respond(result.choices[0].message?.content || "No response.");
    } catch (error) {
      console.error("Ask error:", error);
      await respond("❌ An error occurred while processing your question.");
    }
  });
}
