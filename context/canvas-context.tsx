/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getThemesForPlan, ThemeType } from "@/lib/themes";
import { FrameType } from "@/types/project";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export type LoadingStatusType =
  | "idle"
  | "running"
  | "analyzing"
  | "generating"
  | "completed"
  | "failed";

interface CanvasContextType {
  theme?: ThemeType;
  setTheme: (id: string) => void;
  themes: ThemeType[];
  themeDirty: boolean;
  markThemeSaved: () => void;

  frames: FrameType[];
  setFrames: (frames: FrameType[]) => void;
  updateFrame: (id: string, data: Partial<FrameType>) => void;
  addFrame: (frame: FrameType) => void;

  selectedFrameId: string | null;
  selectedFrame: FrameType | null;
  setSelectedFrameId: (id: string | null) => void;

  selectedElement: {
    frameId: string;
    elementInfo: any;
  } | null;
  setSelectedElement: (element: { frameId: string; elementInfo: any } | null) => void;
  updateElement: (
    frameId: string,
    data: { styles?: any; text?: string; attributes?: any }
  ) => void;

  loadingStatus: LoadingStatusType | null;
  setLoadingStatus: (status: LoadingStatusType | null) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);
export const CanvasProvider = ({
  children,
  initialFrames,
  initialThemeId,
  hasInitialData,
  projectId,
}: {
  children: ReactNode;
  initialFrames: FrameType[];
  initialThemeId?: string;
  hasInitialData: boolean;
  projectId: string | null;
}) => {
  const availableThemes = getThemesForPlan();
  const fallbackThemeId = availableThemes[0]?.id;
  const resolvedInitialTheme =
    initialThemeId && availableThemes.some((theme) => theme.id === initialThemeId)
      ? initialThemeId
      : fallbackThemeId;
  const [themeId, setThemeId] = useState<string>(
    resolvedInitialTheme || ""
  );
  const [savedThemeId, setSavedThemeId] = useState<string>(
    resolvedInitialTheme || ""
  );

  const [frames, setFrames] = useState<FrameType[]>(initialFrames);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{
    frameId: string;
    elementInfo: any;
  } | null>(null);

  const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType | null>(
    null
  );
  const lastStatusRef = useRef<LoadingStatusType | null>(null);
  const realtimeFrameIdsRef = useRef<Set<string>>(new Set());
  const hasRealtimeFramesRef = useRef(false);

  const updateElement = useCallback(
    (
      frameId: string,
      data: { styles?: any; text?: string; attributes?: any }
    ) => {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        iframe.contentWindow?.postMessage(
          { type: "UPDATE_ELEMENT", frameId, ...data },
          "*"
        );
      });

      if (selectedElement && selectedElement.frameId === frameId) {
        setSelectedElement((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            elementInfo: {
              ...prev.elementInfo,
              text: data.text !== undefined ? data.text : prev.elementInfo.text,
              styles: {
                ...prev.elementInfo.styles,
                ...data.styles,
              },
              attributes: {
                ...prev.elementInfo.attributes,
                ...data.attributes,
              },
            },
          };
        });
      }
    },
    [selectedElement]
  );

  useEffect(() => {
    setLoadingStatus(hasInitialData ? "idle" : "running");
    setFrames(initialFrames);
    setThemeId(resolvedInitialTheme || "");
    setSavedThemeId(resolvedInitialTheme || "");
    setSelectedFrameId(null);
    setSelectedElement(null);
  }, [hasInitialData, initialFrames, resolvedInitialTheme, projectId]);

  const theme = availableThemes.find((t) => t.id === themeId);
  const themeDirty = Boolean(themeId && themeId !== savedThemeId);
  const selectedFrame =
    selectedFrameId && frames.length !== 0
      ? frames.find((f) => f.id === selectedFrameId) || null
      : null;

  const projectRealtime = useQuery(
    api.realtime.getProjectState,
    projectId ? { projectId } : "skip"
  );
  const enableRealtimeFrames = false;
  const realtimeFrames = useQuery(
    api.realtime.getProjectFrames,
    enableRealtimeFrames && projectId ? { projectId } : "skip"
  );

  useEffect(() => {
    if (!projectId || !projectRealtime) return;
    if (projectRealtime.themeId) {
      setThemeId(projectRealtime.themeId);
    }
    const nextStatus = projectRealtime.status ?? "idle";
    if (nextStatus === "completed" && lastStatusRef.current !== "completed") {
      setLoadingStatus("completed");
      lastStatusRef.current = "completed";
      setTimeout(() => {
        setLoadingStatus("idle");
      }, 100);
      return;
    }
    setLoadingStatus(nextStatus);
    lastStatusRef.current = nextStatus;
    if (projectRealtime.status === "failed" && projectRealtime.message) {
      toast.error(projectRealtime.message);
    }
  }, [projectId, projectRealtime]);

  useEffect(() => {
    if (!enableRealtimeFrames) return;
    if (!projectId || !realtimeFrames) return;
    if (realtimeFrames.length === 0 && !hasRealtimeFramesRef.current && frames.length > 0) {
      return;
    }
    if (realtimeFrames.length > 0) {
      hasRealtimeFramesRef.current = true;
    }
    const ordered = [...realtimeFrames].sort((a, b) => {
      if (a.order != null && b.order != null) return a.order - b.order;
      return a.updatedAt - b.updatedAt;
    });
    const currentRealtimeIds = new Set(ordered.map((frame) => frame.frameId));
    const trackedRealtimeIds = realtimeFrameIdsRef.current;
    currentRealtimeIds.forEach((id) => trackedRealtimeIds.add(id));

    setFrames((prev) => {
      const next = prev.filter(
        (frame) => !trackedRealtimeIds.has(frame.id) || currentRealtimeIds.has(frame.id)
      );
      ordered.forEach((frame) => {
        const idx = next.findIndex((item) => item.id === frame.frameId);
        const existing = idx === -1 ? null : next[idx];
        const hasHtml = Boolean(frame.htmlContent?.trim());
        const updated: FrameType = {
          id: frame.frameId,
          title: frame.title,
          htmlContent: frame.htmlContent,
          isLoading: hasHtml ? false : existing?.isLoading ?? false,
        };
        if (idx === -1) next.push(updated);
        else next[idx] = { ...next[idx], ...updated };
      });
      return next;
    });
  }, [projectId, realtimeFrames, frames.length]);

  const addFrame = useCallback((frame: FrameType) => {
    setFrames((prev) => [...prev, frame]);
  }, []);

  const updateFrame = useCallback((id: string, data: Partial<FrameType>) => {
    setFrames((prev) => {
      return prev.map((frame) =>
        frame.id === id ? { ...frame, ...data } : frame
      );
    });
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        theme,
        setTheme: (id: string) => {
          if (availableThemes.some((t) => t.id === id)) {
            setThemeId(id);
          }
        },
        themes: availableThemes,
        themeDirty,
        markThemeSaved: () => setSavedThemeId(themeId),
        frames,
        setFrames,
        selectedFrameId,
        selectedFrame,
        setSelectedFrameId,
        selectedElement,
        setSelectedElement,
        updateElement,
        updateFrame,
        addFrame,
        loadingStatus,
        setLoadingStatus,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside CanvasProvider");
  return ctx;
};
