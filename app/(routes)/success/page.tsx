import { redirect } from "next/navigation";

export default async function SuccessPage() {
  redirect("/billing");
}
