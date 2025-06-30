import { Parser } from 'json2csv';

export function formatAsJSON(messages: any[]): Buffer {
    return Buffer.from(JSON.stringify(messages, null, 2));
}

export function formatAsCSV(messages: any[]): Buffer {
    const parser = new Parser();
    return Buffer.from(parser.parse(messages));
}