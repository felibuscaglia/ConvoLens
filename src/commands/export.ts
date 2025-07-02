import { App } from "@slack/bolt";
import { databaseService } from "../services/databaseService";
import { buildExportModal, parseExportModalValues } from "../utils/exportModal";
import { exportService } from "../services/exportService";

export default function registerExport(app: App) {
  app.command("/export", async ({ ack, body, client, respond }) => {
    await ack();

    // Check if channel is synced
    const channel = await databaseService.getChannel(body.channel_id);

    if (!channel?.is_synced) {
      return respond({
        text: "⚠️ ConvoLens hasn't finished syncing this channel yet. Run /activate first.", // TODO: There should be two error message: one for sync not finished and one for /activate never called
        response_type: "ephemeral",
      });
    }

    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildExportModal(),
    });
  });

  app.view("export_submit", async ({ ack, view, body, client }) => {
    let channel = "";

    try {
      await ack();

      const {
        channel: _channel,
        from,
        to,
        format,
      } = parseExportModalValues(view);

      channel = _channel || "";

      const { buffer, filename } = await exportService.exportChannelData(
        channel,
        "general", // TODO: Change
        from || "",
        to || "",
        format as "CSV" | "JSON"
      );

      await client.files.uploadV2({
        channel_id: channel,
        file: buffer,
        title: `ConvoLens Export - ${filename}`,
        initial_comment: "📊 Export completed!",
      });
    } catch (error: any) {
      console.error("Export error:", error);

      let errorMsg = "❌ An error occurred during export.";

      if (error.message) {
        errorMsg = `❌ ${error.message}`;
      } else if (error.data?.error === "not_in_channel") {
        const result = await client.conversations.info({ channel });
        const channelName = `#${result.channel?.name || channel}`;

        errorMsg = [
          `⚠️ I couldn't access the selected channel: \`${channelName}\`.`,
          `This usually happens when I'm *not a member* of that channel.`,
          `➡️ Please invite me to the channel with \`/invite @yourbot\` and try again.`,
        ].join("\n");
      } else if (error.data?.error) {
        errorMsg = `❌ Slack API error: \`${error.data.error}\``;
      }

      await client.chat.postEphemeral({
        channel,
        user: body.user.id,
        text: errorMsg,
      });
    }
  });
}
