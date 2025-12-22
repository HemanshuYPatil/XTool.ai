"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type DeveloperEntry = {
  id: string;
  kindeId: string;
  createdAt: string;
};

const DeveloperTools = () => {
  const [developers, setDevelopers] = useState<DeveloperEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kindeId, setKindeId] = useState("");
  const [removing, setRemoving] = useState<DeveloperEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDevelopers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/developers");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load developers");
      }
      setDevelopers(data?.data ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevelopers();
  }, []);

  const onAddDeveloper = async () => {
    const trimmed = kindeId.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/developers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kindeId: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to add developer");
      }
      setKindeId("");
      await loadDevelopers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const onRemoveDeveloper = async () => {
    if (!removing) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/developers/${removing.kindeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to remove developer");
      }
      setRemoving(null);
      await loadDevelopers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border bg-card/70 p-6 shadow-sm lg:col-span-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Developer tools</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage developer access by Kinde user ID.
          </p>
        </div>
        <Button variant="outline" onClick={loadDevelopers}>
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
        <Input
          value={kindeId}
          onChange={(event) => setKindeId(event.target.value)}
          placeholder="Kinde user ID"
        />
        <Button onClick={onAddDeveloper} disabled={!kindeId.trim() || submitting}>
          Add developer
        </Button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner className="size-8" />
          </div>
        ) : developers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No developers added yet.
          </p>
        ) : (
          developers.map((dev) => (
            <div
              key={dev.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-background p-4 text-sm"
            >
              <div className="space-y-1">
                <p className="font-medium">{dev.kindeId}</p>
                <p className="text-xs text-muted-foreground">
                  Added{" "}
                  {new Date(dev.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRemoving(dev)}
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>

      <Dialog open={Boolean(removing)} onOpenChange={() => setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove developer</DialogTitle>
            <DialogDescription>
              Remove developer access for{" "}
              <span className="font-medium">{removing?.kindeId}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onRemoveDeveloper}
              disabled={submitting}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeveloperTools;
