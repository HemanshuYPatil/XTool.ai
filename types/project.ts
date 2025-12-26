export type ProjectType = {
  id: string;
  name: string;
  theme: string;
  thumbnail?: string;
  frames: FrameType[];
  plan?: "FREE" | "PRO";
  visibility?: "PRIVATE" | "PUBLIC";
  createdAt: Date;
  updatedAt?: Date;
};

export type FrameType = {
  id: string;
  title: string;
  htmlContent: string;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  isLoading?: boolean;
};
