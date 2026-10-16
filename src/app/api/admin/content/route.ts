import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { contentSchema } from "@/lib/content";
import { store } from "@/lib/store";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return NextResponse.json(await store().getContent());
}

/** Save the whole site content, then refresh the public page so changes show immediately. */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const parsed = contentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ error: `${issue?.path.join(" › ") || "Content"}: ${issue?.message ?? "invalid"}` }, { status: 400 });
  }
  await store().saveContent(parsed.data);
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
