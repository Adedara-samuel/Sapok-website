import Experience from "@/components/site/Experience";
import { store } from "@/lib/store";

// Content is cached and refreshed instantly when the admin saves (revalidatePath("/")).
export const revalidate = 3600;

export default async function Home() {
  const content = await store().getContent();
  return <Experience content={content} />;
}
