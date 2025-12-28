"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export const BackButton = () => {
  const router = useRouter();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="rounded-xl gap-2 -ml-2 text-muted-foreground hover:text-foreground"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/billing");
        }
      }}
    >
      <ArrowLeftIcon className="size-4" />
      Back
    </Button>
  );
};
