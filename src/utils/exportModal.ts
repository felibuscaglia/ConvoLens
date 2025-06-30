import { ViewOutput } from "@slack/bolt";

export function buildExportModal() {
  return {
    type: "modal" as const,
    callback_id: "export_submit",
    title: { type: "plain_text" as const, text: "Export Conversation" },
    submit: { type: "plain_text" as const, text: "Export" },
    blocks: [
      {
        type: "input" as const,
        block_id: "channel",
        element: {
          type: "conversations_select" as const,
          action_id: "channel_id",
        },
        label: { type: "plain_text" as const, text: "Channel" },
      },
      {
        type: "input" as const,
        block_id: "from_date",
        element: {
          type: "datepicker" as const,
          action_id: "from",
        },
        label: { type: "plain_text" as const, text: "From date" },
      },
      {
        type: "input" as const,
        block_id: "to_date",
        element: {
          type: "datepicker" as const,
          action_id: "to",
        },
        label: { type: "plain_text" as const, text: "To date" },
      },
      {
        type: "input" as const,
        block_id: "format",
        element: {
          type: "static_select" as const,
          action_id: "format_id",
          options: [
            { text: { type: "plain_text" as const, text: "JSON" }, value: "JSON" },
            { text: { type: "plain_text" as const, text: "CSV" }, value: "CSV" },
          ],
        },
        label: { type: "plain_text" as const, text: "Format" },
      },
      {
        type: "input" as const,
        block_id: "threads",
        element: {
          type: "checkboxes" as const,
          action_id: "include_threads",
          options: [
            {
              text: { type: "plain_text" as const, text: "Include threads" },
              value: "yes",
            },
          ],
        },
        label: { type: "plain_text" as const, text: "Options" },
        optional: true,
      },
    ],
  };
}

export function parseExportModalValues(view: ViewOutput) {
  return {
    channel: view.state.values.channel.channel_id.selected_conversation,
    from: view.state.values.from_date.from.selected_date,
    to: view.state.values.to_date.to.selected_date,
    format: view.state.values.format.format_id.selected_option?.value,
    includeThreads:
      !!view.state.values.threads?.include_threads?.selected_options?.length,
  };
}
