import { randomUUID } from "crypto";
import { getSupabase } from "./supabase";
import { readLocalDB, writeLocalDB } from "./local";

export type MessageKind = "TEXT" | "STATUS";

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  kind: MessageKind;
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface ThreadSummary {
  lastMessage?: Message;
  unread: number;
}

function fromRow(row: any): Message {
  return {
    id: row.id,
    applicationId: row.application_id,
    senderId: row.sender_id,
    kind: row.kind === "STATUS" ? "STATUS" : "TEXT",
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at ?? undefined,
  };
}

function oldestFirst(a: Message, b: Message) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export async function listMessages(applicationId: string): Promise<Message[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true })
      .limit(1000);
    if (error) throw new Error(error.message);
    return (data || []).map(fromRow);
  }
  return (readLocalDB().messages as Message[])
    .filter((m) => m.applicationId === applicationId)
    .sort(oldestFirst);
}

export async function createMessage(
  applicationId: string,
  senderId: string,
  body: string,
  kind: MessageKind = "TEXT"
): Promise<Message> {
  const message: Message = {
    id: randomUUID(),
    applicationId,
    senderId,
    kind,
    body,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("messages").insert({
      id: message.id,
      application_id: applicationId,
      sender_id: senderId,
      kind,
      body,
      created_at: message.createdAt,
    });
    if (error) throw new Error(error.message);
    return message;
  }

  writeLocalDB((db) => {
    db.messages.push(message);
  });
  return message;
}

/** Marks everything the other party sent in this conversation as read. */
export async function markThreadRead(applicationId: string, readerId: string): Promise<void> {
  const readAt = new Date().toISOString();
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: readAt })
      .eq("application_id", applicationId)
      .neq("sender_id", readerId)
      .is("read_at", null);
    if (error) throw new Error(error.message);
    return;
  }

  const hasUnread = (readLocalDB().messages as Message[]).some(
    (m) => m.applicationId === applicationId && m.senderId !== readerId && !m.readAt
  );
  if (!hasUnread) return;
  writeLocalDB((db) => {
    for (const m of db.messages as Message[]) {
      if (m.applicationId === applicationId && m.senderId !== readerId && !m.readAt) m.readAt = readAt;
    }
  });
}

/** Last message and unread count for each conversation, from one reader's point of view. */
export async function getThreadSummaries(
  applicationIds: string[],
  readerId: string
): Promise<Record<string, ThreadSummary>> {
  const summaries: Record<string, ThreadSummary> = {};
  for (const id of applicationIds) summaries[id] = { unread: 0 };
  if (applicationIds.length === 0) return summaries;

  let messages: Message[];
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .in("application_id", applicationIds)
      .order("created_at", { ascending: true })
      .limit(5000);
    if (error) throw new Error(error.message);
    messages = (data || []).map(fromRow);
  } else {
    messages = (readLocalDB().messages as Message[])
      .filter((m) => applicationIds.includes(m.applicationId))
      .sort(oldestFirst);
  }

  for (const message of messages) {
    const summary = summaries[message.applicationId];
    summary.lastMessage = message;
    if (message.senderId !== readerId && !message.readAt) summary.unread += 1;
  }
  return summaries;
}
