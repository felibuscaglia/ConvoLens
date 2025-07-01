import openaiClient from "./openaiClient";

export class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }
}

export const embeddingService = new EmbeddingService();