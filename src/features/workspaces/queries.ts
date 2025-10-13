import { Query } from "node-appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
  try {
    const { tables, account } = await createSessionClient();

    const user = await account.get();

    const members = await tables.listRows(DATABASE_ID, MEMBERS_ID, [
      Query.equal("userId", user.$id),
    ]);

    if (members.total === 0) {
      return { rows: [], total: 0 };
    }
    const workspaceIds = members.rows.map((member) => member.workspaceId);

    const workspaces = await tables.listRows(DATABASE_ID, WORKSPACES_ID, [
      Query.orderDesc("$createdAt"),
      Query.contains("$id", workspaceIds),
    ]);

    return workspaces;
  } catch {
    return { rows: [], total: 0 };
  }
};

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  try {
    const { tables, account } = await createSessionClient();
    const user = await account.get();

    const member = await getMember({
      tables,
      userId: user.$id,
      workspaceId,
    });

    if (!member) {
      return null;
    }

    const workspace = (await tables.getRow(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    )) as any;

    return workspace;
  } catch {
    return null;
  }
};

interface GetWorkspaceInfoProps {
  workspaceId: string;
}

export const getWorkspaceInfo = async ({
  workspaceId,
}: GetWorkspaceInfoProps) => {
  try {
    const { tables } = await createSessionClient();

    const workspace = (await tables.getRow(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    )) as any;

    return {
      name: workspace.name,
    };
  } catch {
    return null;
  }
};
