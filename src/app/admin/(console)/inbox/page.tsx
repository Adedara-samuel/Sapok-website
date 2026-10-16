import { store } from "@/lib/store";
import InboxClient from "@/components/admin/InboxClient";

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const [enquiries, { id }] = await Promise.all([store().listEnquiries(), searchParams]);
  return <InboxClient initial={enquiries} openId={id ?? null} />;
}
