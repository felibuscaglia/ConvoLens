# ConvoLens Slack App – Activation and Message Sync Flow

## 📘 Objective

Extend the Slack app with the following functionality:

1. **`/activate` command**  
   - Starts syncing all historical messages (and future ones) from a specific channel.
   - Stores messages in **Supabase**, with their respective **OpenAI embeddings** (`text-embedding-3-small`).
   - Adds an `is_synced` flag to indicate when the initial sync has completed.

2. **Restrict** `/ask` and `/export` commands  
   - Only available if the channel has been activated and the sync is complete.

---

## 🧠 Commands Summary

### `/activate`
- Triggers message synchronization for the current channel.
- Responds with an ephemeral "sync in progress" message.
- Syncs all historical messages (up to Slack limits).
- Computes and stores OpenAI embeddings for all messages.
- Updates a flag once sync completes.
- Saves metadata like:
  - `channel_id`, `channel_name`
  - `synced_at`, `is_synced`

### `/ask` and `/export`
- These commands must:
  - Check Supabase for the current `channel_id`
  - Ensure that `is_synced === true`
  - If not synced, reply with:  
    `"⚠️ ConvoLens hasn't finished syncing this channel yet. Run /activate first."`

---

## 🗃️ Supabase Setup

Create a Supabase project with the following schema:

### Table: `messages`
| Column         | Type        |
|----------------|-------------|
| id             | uuid (PK)   |
| channel_id     | text        |
| ts             | text        |
| user_id        | text        |
| username       | text        |
| text           | text        |
| embedding      | vector      |
| created_at     | timestamp   |

### Table: `channels`
| Column         | Type        |
|----------------|-------------|
| channel_id     | text (PK)   |
| channel_name   | text        |
| is_synced      | boolean     |
| synced_at      | timestamp   |

---

## ⚙️ Integration Requirements

### Supabase Client
- Use `@supabase/supabase-js` in TypeScript.
