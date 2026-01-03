import { redirect } from "next/navigation";
import { showXCreator } from "@/lib/feature-flags";

export default function CreatorModulePage() {
  if (!showXCreator) {
    redirect("/xtool");
  }

  redirect("/xtool/module-xcreator");
}
