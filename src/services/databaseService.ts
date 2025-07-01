import supabase from "./supabaseClient";
import { Message, Channel } from "../types/database";

export class DatabaseService {
  async createChannel(channelId: string, channelName: string): Promise<void> {
    await supabase.from("channels").upsert({
      id: channelId,
      name: channelName,
      is_synced: false,
      synced_at: null,
    });
  }

  async updateChannelSyncStatus(
    channelId: string,
    isSynced: boolean
  ): Promise<void> {
    await supabase
      .from("channels")
      .update({
        is_synced: isSynced,
        synced_at: isSynced ? new Date().toISOString() : null,
      })
      .eq("id", channelId);
  }

  async getChannel(channelId: string): Promise<Channel | null> {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .eq("id", channelId)
      .maybeSingle();

    if (error) return null;

    return data;
  }

  async insertMessage(
    message: Omit<Message, "id" | "created_at">
  ): Promise<void> {
    await supabase.from("messages").insert({
      ...message,
      created_at: new Date().toISOString(),
    });
  }

  async getMessagesByChannel(channelId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("ts", { ascending: true });

    if (error) return [];

    return data || [];
  }

  async searchMessagesBySimilarity(
    channelId: string,
    queryEmbedding: number[],
    limit = 10
  ): Promise<Message[]> {
    const { data, error } = await supabase.rpc("match_messages", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
      channel_id_filter: channelId,
    });

    if (error) return [];

    return data || [];
  }
}

export const databaseService = new DatabaseService();
