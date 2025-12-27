"use client";

import { useGetProjectById } from "@/features/use-project-id";
import { useParams, useRouter } from "next/navigation";
import Header from "./_common/header";
import Canvas from "@/components/canvas";
import { CanvasProvider, useCanvas } from "@/context/canvas-context";
import { useEffect } from "react";
import { StudioLoader } from "@/components/studio-loader";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: project, isPending, isError, error } = useGetProjectById(id);
  // const frames = project?.frames || [];
  // const themeId = project?.theme || "";

  const hasInitialData = project?.frames.length > 0;

  useEffect(() => {
    if (!isError) return;
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 401) {
      router.push("/api/auth/login");
    }
  }, [error, isError, router]);

  if (isError) {
    return (
      <div className="p-6">
        {((error as { response?: { status?: number } })?.response?.status ??
          500) === 401
          ? "Redirecting to login..."
          : "Failed to load project."}
      </div>
    );
  }

  if (!isPending && !project) {
    return <div className="p-6">Project not found</div>;
  }

  return (
    <div
      className="relative h-screen w-full
   flex flex-col
  "
    >
      <Header
        projectName={project?.name}
        projectId={project?.id}
        visibility={project?.visibility}
        themeId={project?.theme}
        plan={project?.plan}
      />

      <CanvasProvider
        initialFrames={project?.frames ?? []}
        initialThemeId={project?.theme}
        hasInitialData={hasInitialData}
        projectId={project?.id}
        plan={project?.plan}
      >
        <ProjectContent project={project} isPending={isPending} />
      </CanvasProvider>
    </div>
  );
};

const ProjectContent = ({
  project,
  isPending,
}: {
  project: any;
  isPending: boolean;
}) => {
  const { loadingStatus } = useCanvas();
  const isDone = !isPending && (loadingStatus === "idle" || loadingStatus === "completed");
  const showLoader = isPending || (loadingStatus && loadingStatus !== "idle" && loadingStatus !== "completed");

  return (
    <>
      {(showLoader || isDone) && <StudioLoader isDone={isDone} />}
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <Canvas
            projectId={project?.id}
            projectName={project?.name}
            isPending={isPending}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
