/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { fetchRealtimeSubscriptionToken } from "@/app/action/realtime";
import { getThemesForPlan, ThemeType } from "@/lib/themes";
import { FrameType } from "@/types/project";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type LoadingStatusType =
  | "idle"
  | "running"
  | "analyzing"
  | "generating"
  | "completed";

interface CanvasContextType {
  theme?: ThemeType;
  setTheme: (id: string) => void;
  themes: ThemeType[];
  plan?: string;
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
  plan,
}: {
  children: ReactNode;
  initialFrames: FrameType[];
  initialThemeId?: string;
  hasInitialData: boolean;
  projectId: string | null;
  plan?: string;
}) => {
  const availableThemes = getThemesForPlan(plan);
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

  //Update the LoadingState Inngest Realtime event
  const { freshData } = useInngestSubscription({
    refreshToken: fetchRealtimeSubscriptionToken,
  });

  useEffect(() => {
    if (!freshData || freshData.length === 0) return;

    freshData.forEach((message) => {
      const { data, topic } = message;

      if (data.projectId !== projectId) return;

      switch (topic) {
        case "generation.start":
          const status = data.status;
          setLoadingStatus(status);
          break;
        case "analysis.start":
          setLoadingStatus("analyzing");
        case "analysis.complete":
          setLoadingStatus("generating");
          if (data.theme) setThemeId(data.theme);

          if (data.screens && data.screens.length > 0) {
            const skeletonFrames: FrameType[] = data.screens.map((s: any) => ({
              id: s.id,
              title: s.name,
              htmlContent: "",
              isLoading: true,
            }));
            setFrames((prev) => [...prev, ...skeletonFrames]);
          }
          break;
        case "frame.created":
          if (data.frame) {
            setFrames((prev) => {
              const newFrames = [...prev];
              const idx = newFrames.findIndex((f) => f.id === data.screenId);
              if (idx !== -1) newFrames[idx] = data.frame;
              else newFrames.push(data.frame);
              return newFrames;
            });
          }
          break;
        case "generation.complete":
          setLoadingStatus("completed");
          setTimeout(() => {
            setLoadingStatus("idle");
          }, 100);
          break;
        default:
          break;
      }
    });
  }, [projectId, freshData]);

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
        plan,
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
