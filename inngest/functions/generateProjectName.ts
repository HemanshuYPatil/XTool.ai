import prisma from "@/lib/prisma";
import { generateProjectName } from "@/app/action/action";
import { inngest } from "../client";

const PLACEHOLDER_PROJECT_NAME = "Q model";

export const generateProjectNameTask = inngest.createFunction(
  { id: "generate-project-name" },
  { event: "project/name.generate" },
  async ({ event }) => {
    const { projectId, userId, prompt } = event.data as {
      projectId?: string;
      userId?: string;
      prompt?: string;
    };

    if (!projectId || !userId || !prompt) {
      return { skipped: true };
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project || project.name !== PLACEHOLDER_PROJECT_NAME) {
      return { skipped: true };
    }

    const name = await generateProjectName(prompt);

    await prisma.project.update({
      where: { id: projectId, userId },
      data: { name },
    });

    return { updated: true, name };
  }
);
