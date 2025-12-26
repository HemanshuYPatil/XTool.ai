"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PromptInput from "@/components/prompt-input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type FrameSummary = {
  id: string;
  title: string;
};

const ContributionPanel = ({
  shareToken,
  frames,
}: {
  shareToken: string;
  frames: FrameSummary[];
}) => {
  const [selectedFrame, setSelectedFrame] = useState<FrameSummary | null>(null);
  const [promptText, setPromptText] = useState("");
  const [htmlDraft, setHtmlDraft] = useState("");
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDialogOpen = Boolean(selectedFrame);
  const canSubmit =
    (mode === "ai"
      ? promptText.trim().length > 0
      : htmlDraft.trim().length > 0) && selectedFrame;

  const orderedFrames = useMemo(
    () => [...frames].sort((a, b) => a.title.localeCompare(b.title)),
    [frames]
  );

  const handleSubmit = async () => {
    if (!selectedFrame || !promptText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: shareToken,
          frameId: selectedFrame.id,
          prompt: mode === "ai" ? promptText.trim() : undefined,
          htmlContent: mode === "manual" ? htmlDraft.trim() : undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to submit contribution.");
      }
      toast.success("Contribution submitted for review.");
      setPromptText("");
      setHtmlDraft("");
      setSelectedFrame(null);
      setMode("ai");
    } catch (error) {
      console.log(error);
      toast.error(
        (error as Error)?.message ?? "Unable to submit contribution."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-muted/20 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          Propose changes
        </p>
        <h2 className="text-xl font-semibold">Submit an AI contribution</h2>
        <p className="text-sm text-muted-foreground">
          Generate an AI update for a specific frame. The project owner reviews
          your proposal before it applies.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {orderedFrames.map((frame) => (
          <div
            key={frame.id}
            className="rounded-2xl border border-border/60 bg-background px-4 py-4"
          >
            <p className="text-sm font-semibold">{frame.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Target this frame with a focused AI update.
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setSelectedFrame(frame)}
            >
              Propose edit
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={() => setSelectedFrame(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFrame
                ? `Propose changes for ${selectedFrame.title}`
                : "Propose changes"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={mode === "ai" ? "default" : "outline"}
              onClick={() => setMode("ai")}
              disabled={isSubmitting}
            >
              AI prompt
            </Button>
            <Button
              size="sm"
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              disabled={isSubmitting}
            >
              Manual HTML
            </Button>
          </div>

          {mode === "ai" ? (
            <PromptInput
              promptText={promptText}
              setPromptText={setPromptText}
              className="min-h-[140px]"
              hideSubmitBtn={true}
            />
          ) : (
            <Textarea
              value={htmlDraft}
              onChange={(event) => setHtmlDraft(event.target.value)}
              placeholder="Paste the updated HTML for this frame..."
              className="min-h-[180px]"
            />
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelectedFrame(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  Submitting
                </>
              ) : (
                "Submit contribution"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContributionPanel;
