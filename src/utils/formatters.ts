import { Parser } from "json2csv";
import { Message } from "../types/database";

export function formatAsJSON(messages: Partial<Message>[]): Buffer {
  return Buffer.from(JSON.stringify(messages, null, 2));
}

export function formatAsCSV(messages: Partial<Message>[]): Buffer {
  const parser = new Parser();
  return Buffer.from(parser.parse(messages));
}
