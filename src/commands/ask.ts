import { App } from "@slack/bolt";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { isQuestion } from "../utils/validators";
import {
  retrieveRelevantMessages,
  summarizeChunks,
} from "../services/conversationStore";
import openaiClient from "../services/openaiClient";
import { parseAskCommand } from "../utils/askParser";

export default function registerAsk(app: App) {
  app.command("/ask", async ({ ack, body, respond }) => {
    await ack();
    const text = body.text;

    if (!isQuestion(text)) {
      return respond({ text: "Please enter a valid question." });
    }

    const { channel, from, to, question } = await parseAskCommand(
      text,
      body.channel_id
    );
    const messages = await retrieveRelevantMessages(channel, from, to);
    const summarizedContext = await summarizeChunks(messages);

    const prompt: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `Answer questions based on provided Slack messages.`,
      },
      {
        role: "user",
        content: `${summarizedContext}\n\nQuestion: ${question}`,
      },
    ];

    const result = await openaiClient.chat.completions.create({
      model: 'o4-mini',
      messages: prompt
    });

    await respond(result.choices[0].message?.content || 'No response.');
  });
}
