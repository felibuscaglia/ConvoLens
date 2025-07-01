import { App } from "@slack/bolt";
import { fetchConversation } from "../services/conversationStore";
import { parseExportModalValues, buildExportModal } from "../utils/exportModal";
import { formatAsCSV, formatAsJSON } from "../utils/formatters";

export default function registerExport(app: App) {
  app.command("/export", async ({ ack, body, client }) => {
    await ack();
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildExportModal(),
    });
  });

  app.view("export_submit", async ({ ack, view, body, client }) => {
    let channel: string = "";

    try {
      await ack();
      const {
        channel: _channel,
        from,
        to,
        format,
        includeThreads,
      } = parseExportModalValues(view);

      channel = _channel || "";

      const messages = await fetchConversation(
        channel,
        from || "",
        to || "",
        includeThreads
      );
      const fileBuffer =
        format === "CSV" ? formatAsCSV(messages) : formatAsJSON(messages);

      await client.files.uploadV2({
        channel_id: channel,
        file: fileBuffer,
        filename: `export-${channel}-${Date.now()}.${format?.toLowerCase()}`, // TODO: Change the filename, it's messy
      });
    } catch (error: any) {
      console.error("Export error:", error.data || error);

      let errorMsg = "❌ An error occurred during export.";
      if (error.data?.error === "not_in_channel") {
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
