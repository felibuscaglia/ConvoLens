import dayjs from "dayjs";

export async function parseAskCommand(text: string, defaultChannel: string) {
  const dateRegex = /from (.*?) to (.*?)(\?|$)/i;
  const match = text.match(dateRegex);
  let from = dayjs().subtract(7, "day").format("YYYY-MM-DD"); // TODO: It should read the entire conversation
  let to = dayjs().format("YYYY-MM-DD");

  if (match) {
    from = dayjs(match[1]).format("YYYY-MM-DD");
    to = dayjs(match[2]).format("YYYY-MM-DD");
  }

  return {
    channel: defaultChannel,
    from,
    to,
    question: text,
  };
}
