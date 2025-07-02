import { Parser } from "json2csv";
import { Message } from "../types/database";

export function formatAsJSON(messages: Message[]): Buffer {
  return Buffer.from(JSON.stringify(messages, null, 2));
}

export function formatAsCSV(messages: Message[]): Buffer {
  const parser = new Parser();
  return Buffer.from(parser.parse(messages));
}
