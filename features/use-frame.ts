"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

export const useRegenerateFrame = (projectId: string) => {
  return useMutation({
    mutationFn: async ({
      frameId,
      prompt,
    }: {
      frameId: string;
      prompt: string;
    }) => {
      const res = await axios.post(
        `/api/project/${projectId}/frame/regenerate`,
        {
          frameId,
          prompt,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Frame regeneration started");
    },
    onError: () => {
      toast.error("Failed to regenerate frame");
    },
  });
};

export const useDeleteFrame = (projectId: string) => {
  return useMutation({
    mutationFn: async (frameId: string) => {
      const res = await axios.delete(`/api/project/${projectId}/frame/delete`, {
        data: { frameId },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Frame deleted successfully");
    },
    onError: (error: unknown) => {
      console.log("Delete frame failed", error);
      toast.error("Failed to delete frame");
    },
  });
};

export const useUpdateFrame = (projectId: string) => {
  return useMutation({
    mutationFn: async ({
      frameId,
      htmlContent,
    }: {
      frameId: string;
      htmlContent: string;
    }) => {
      const res = await axios.patch(`/api/project/${projectId}/frame/update`, {
        frameId,
        htmlContent,
      });
      return res.data;
    },
  });
};
