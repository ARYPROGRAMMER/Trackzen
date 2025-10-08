import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, WORKSPACES_ID } from "@/config";
import { ID, TablesDB } from "node-appwrite";

const app = new Hono().post(
  "/",
  zValidator("json", createWorkspaceSchema),
  sessionMiddleware,
  async (c) => {
    const tables = c.get("tables");
    const user = c.get("user");

    const { name } = c.req.valid("json");

    try {
      const workspace = await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: WORKSPACES_ID,
        rowId: ID.unique(),
        data: { name , userId: user.$id },
      });

      return c.json({ data: workspace });
    } catch (err) {
      console.error("createRow failed", err);
      return c.json({ error: "Failed to create workspace" }, 500);
    }
  }
);

export default app;
