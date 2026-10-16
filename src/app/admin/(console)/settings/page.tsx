import { getOrSeedAdmin } from "@/lib/auth";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const admin = await getOrSeedAdmin();
  return <SettingsForm email={admin.email} lastChanged={admin.updatedAt} />;
}
