import { cookies } from "next/headers";
import { Account, Client, Query, TablesDB } from "node-appwrite";
import { AUTH_COOKIE } from "../auth/constants";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";

export const getWorkspaces = async () => {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const session = await cookies().get(AUTH_COOKIE);

    if (!session) return { rows: [], total: 0 };

    client.setSession(session.value);

    const tables = new TablesDB(client);
    const account = new Account(client);
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
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const session = await cookies().get(AUTH_COOKIE);

    if (!session) return null;

    client.setSession(session.value);

    const tables = new TablesDB(client);
    const account = new Account(client);
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
