import { store } from "@/lib/store";
import ContentEditor from "@/components/admin/ContentEditor";

export default async function ContentPage() {
  return <ContentEditor initial={await store().getContent()} />;
}
