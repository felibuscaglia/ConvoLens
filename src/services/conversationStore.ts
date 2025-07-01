import { WebClient } from "@slack/web-api";
import { MessageElement } from "@slack/web-api/dist/types/response/ConversationsHistoryResponse";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import dayjs from "dayjs";
import openaiClient from "./openaiClient";
import { config } from "../config/env";

const slack = new WebClient(config.SLACK_BOT_TOKEN);

// TODO: Check if this works with DMs
export async function fetchConversation(
  channel: string,
  from: string,
  to: string,
  includeThreads = false
) {
  let cursor: string | undefined = undefined;
  let allMessages: MessageElement[] = [];
  const fromTs = dayjs(from).unix();
  const toTs = dayjs(to).add(1, 'day').unix();

  do {
    const { messages = [], response_metadata = {} } =
      await slack.conversations.history({
        channel,
        oldest: fromTs.toString(),
        latest: toTs.toString(),
        inclusive: true,
        cursor,
      });

    allMessages.push(...messages);
    cursor = response_metadata.next_cursor;
  } while (cursor);

  if (includeThreads) {
    for (const msg of allMessages.filter((m) => m.thread_ts)) {
      const { messages = [] } = await slack.conversations.replies({
        channel,
        ts: msg.thread_ts || "",
      });
      allMessages.push(...messages);
    }
  }

  return allMessages;
}

export async function retrieveRelevantMessages(
  channel: string,
  from: string,
  to: string
) {
  return await fetchConversation(channel, from, to, true);
}

export async function summarizeChunks(
  messages: MessageElement[]
): Promise<string> {
  const chunks: string[] = [];
  for (let i = 0; i < messages.length; i += 20) {
    const chunk = messages
      .slice(i, i + 20)
      .map((m) => `- ${m.user}: ${m.text}`)
      .join("\n");
    const prompt: ChatCompletionMessageParam[] = [
      { role: "system", content: "Summarize the following Slack messages." },
      { role: "user", content: chunk },
    ];
    const result = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompt,
    });
    const resultContent = result.choices[0].message?.content;

    if (resultContent) {
      chunks.push(resultContent);
    }
  }
  
  return chunks.join("\n");
}
