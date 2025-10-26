import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "../members/utils";
import { DATABASE_ID, PROJECTS_ID } from "@/config";

interface GetProjectProps {
  projectId: string;
}

export const getProject = async ({ projectId }: GetProjectProps) => {
  try {
    const { tables, account } = await createSessionClient();
    const user = await account.get();

    const project = (await tables.getRow(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    )) as any;

    const member = await getMember({
      tables,
      userId: user.$id,
      workspaceId: project.workspaceId,
    });

    if (!member) {
      return null;
    }

    return project;
  } catch {
    return null;
  }
};
