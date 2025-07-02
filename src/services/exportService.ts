import { formatAsCSV, formatAsJSON } from "../utils/formatters";
import { databaseService } from "./databaseService";

class ExportService {
  async exportChannelData(
    channelId: string,
    channelName: string,
    fromDate: string,
    toDate: string,
    format: "CSV" | "JSON"
  ): Promise<{ buffer: Buffer; filename: string }> {
    // Fetch messages from database
    const messages = await databaseService.getMessagesByDateRange(
      channelId,
      fromDate,
      toDate
    );

    if (!messages.length) {
      throw new Error("No messages found in the specified date range");
    }

    const buffer =
      format === "CSV" ? formatAsCSV(messages) : formatAsJSON(messages);

    const dateRange = `${fromDate}_to_${toDate}`;
    const filename = `convolens_export_${channelName}_${dateRange}.${format.toLowerCase()}`;

    return { buffer, filename };
  }
}

export const exportService = new ExportService();
