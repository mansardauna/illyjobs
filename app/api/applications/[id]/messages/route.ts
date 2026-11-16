import { NextResponse } from "next/server";
import { createMessage, listMessages, markThreadRead } from "@/lib/db/messages";
import { getSessionUser } from "@/lib/auth/session";
import { getApplicationAccess } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 2000;

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/** The conversation for one application. Reading it marks it as read. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in.", 401);

    const access = await getApplicationAccess(user, params.id);
    if (!access) return fail("Conversation not found.", 404);

    await markThreadRead(params.id, user.id);
    const messages = await listMessages(params.id);
    const { application, job } = access;

    return NextResponse.json({
      success: true,
      viewerRole: access.role,
      application: {
        id: application.id,
        status: application.status,
        applicantName: application.applicantName,
        submittedAt: application.submittedAt,
      },
      job: { id: job.id, title: job.title, slug: job.slug, company: job.company },
      messages: messages.map((m) => ({
        id: m.id,
        kind: m.kind,
        body: m.body,
        createdAt: m.createdAt,
        mine: m.senderId === user.id,
        readAt: m.readAt || null,
      })),
    });
  } catch (error) {
    console.error("Failed to load messages:", error);
    return fail("Failed to load messages.", 500);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("Please sign in.", 401);

    const access = await getApplicationAccess(user, params.id);
    if (!access) return fail("Conversation not found.", 404);

    const { body } = await request.json();
    const text = typeof body === "string" ? body.trim() : "";
    if (!text) return fail("Please type a message.", 400);
    if (text.length > MAX_MESSAGE_LENGTH) {
      return fail(`Messages can be at most ${MAX_MESSAGE_LENGTH} characters.`, 400);
    }

    const message = await createMessage(params.id, user.id, text);
    return NextResponse.json({
      success: true,
      message: { id: message.id, kind: message.kind, body: message.body, createdAt: message.createdAt, mine: true, readAt: null },
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    return fail("Failed to send message.", 500);
  }
}
