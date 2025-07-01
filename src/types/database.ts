export interface Message {
    id: string;
    channel_id: string;
    ts: string;
    user_id: string;
    username: string;
    text: string;
    embedding: number[];
    created_at: string;
}

export interface Channel {
    id: string;
    name: string;
    is_synced: boolean;
    synced_at: string | null;
}