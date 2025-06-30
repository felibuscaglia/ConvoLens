export function isQuestion(text: string): boolean {
  return /\?$/.test(text.trim());
}
