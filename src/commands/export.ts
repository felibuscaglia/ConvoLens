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
    try {
      await ack();
      const { channel, from, to, format, includeThreads } =
        parseExportModalValues(view);

      const messages = await fetchConversation(
        channel || "",
        from || "",
        to || "",
        includeThreads
      );
      const fileBuffer =
        format === "CSV" ? formatAsCSV(messages) : formatAsJSON(messages);

      await client.files.uploadV2({
        channels: body.user.id,
        file: fileBuffer,
        filename: `export-${channel}-${Date.now()}.${format?.toLowerCase()}`,
        filetype: format?.toLowerCase(),
      });
    } catch (error) {
      console.error("Export error:", error);
    }
  });
}
