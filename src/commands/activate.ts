import { App } from "@slack/bolt";
import { syncService } from "../services/syncService";
import { databaseService } from "../services/databaseService";

export default function registerActivate(app: App) {
  app.command("/activate", async ({ ack, body, respond, client }) => {
    await ack();

    const channelId = body.channel_id;

    // Check if channel is already synced
    const existingChannel = await databaseService.getChannel(channelId);

    if (existingChannel?.is_synced) {
      return respond({
        text: "✅ This channel is already activated and synced!",
        response_type: "ephemeral",
      });
    }

    // Get channel info
    const channelInfo = await client.conversations.info({ channel: channelId });
    const channelName = channelInfo.channel?.name || "unknown";

    try {
      await respond({
        text: "🔄 Starting to sync this channel... This may take a few minutes.",
        response_type: "ephemeral",
      });

      // TODO: Use queues/jobs
      await syncService.syncChannel(channelId, channelName);

      await respond({
        text: `✅ Channel sync completed successfully! The channel \`#${channelName}\` is now ready for exports and analysis.`,
        response_type: "ephemeral",
      });
    } catch (error) {
      console.error("Activation error:", error);
      await respond({
        text: "❌ Failed to start channel sync. Please try again.",
        response_type: "ephemeral",
      });
    }
  });
}
