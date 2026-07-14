import { getSiteSettings } from "@/lib/getSiteSettings";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  const contact = await getSiteSettings();
  return <AdminLoginForm contact={contact} />;
}
