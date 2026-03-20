import { redirect } from "next/navigation";

// Redirect to locale-aware Pfleger dashboard
export default function PflegerDashboard() {
  redirect("/de/dashboard/pfleger");
}
