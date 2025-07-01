import { WebClient } from "@slack/web-api";
import { MessageElement } from "@slack/web-api/dist/types/response/ConversationsHistoryResponse";
import { config } from "../config/env";
import { databaseService } from "./databaseService";
import { embeddingService } from "./embeddingService";

const slack = new WebClient(config.SLACK_BOT_TOKEN); // TODO: Unify Slack clients

class SyncService {
  async syncChannel(channelId: string, channelName: string): Promise<void> {
    // Create or update channel record
    await databaseService.createChannel(channelId, channelName);

    // Fetch all historical messages
    const messages = await this.fetchAllMessages(channelId);

    // Process messages in batches to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      await this.processMessageBatch(channelId, batch);
    }

    // Mark channel as synced
    await databaseService.updateChannelSyncStatus(channelId, true);
  }

  private async fetchAllMessages(channelId: string): Promise<MessageElement[]> {
    let cursor: string | undefined = undefined;
    const allMessages: MessageElement[] = [];

    do {
      const { messages = [], response_metadata = {} } =
        await slack.conversations.history({
          channel: channelId,
          cursor,
        });

      allMessages.push(...messages);
      cursor = response_metadata.next_cursor;
    } while (cursor);

    return allMessages;
  }

  private async processMessageBatch(
    channelId: string,
    messages: MessageElement[]
  ): Promise<void> {
    // Filter out messages without text or with empty text
    const validMessages = messages.filter(
      (msg) => msg.text?.trim().length && msg.user
    );

    if (!validMessages.length) {
      return; // No valid messages to process
    }

    // Generate embddings only for messages with text
    const texts = validMessages.map((msg) => msg.text!.trim());
    const embeddings = await embeddingService.generateEmbeddings(texts);

    // Insert messages with embeddings
    for (let i = 0; i < validMessages.length; i++) {
      const message = validMessages[i];
      const embedding = embeddings[i];

      await databaseService.insertMessage({
        channel_id: channelId,
        ts: message.ts || "",
        user_id: message.user!,
        username: message.user!, // TODO: Fetch actual username
        text: message.text!.trim(),
        embedding,
      });
    }
  }
}

export const syncService = new SyncService();
