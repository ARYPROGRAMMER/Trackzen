import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  MEMBERS_ID,
  WORKSPACES_ID,
} from "@/config";
import { ID } from "node-appwrite";
import { MemberRole } from "@/features/members/type";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const tables = c.get("tables");

    const workspaces = await tables.listRows(DATABASE_ID, WORKSPACES_ID);

    return c.json({ data: workspaces });
  })

  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const tables = c.get("tables");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image
        );

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      try {
        const workspace = await tables.createRow({
          databaseId: DATABASE_ID,
          tableId: WORKSPACES_ID,
          rowId: ID.unique(),
          data: { name, userId: user.$id, imageUrl: uploadedImageUrl },
        });

        await tables.createRow({
          databaseId: DATABASE_ID,
          tableId: MEMBERS_ID,
          rowId: ID.unique(),
          data: {
            userId: user.$id,
            workspaceId: workspace.$id,
            role: MemberRole.ADMIN,
          },
        });

        return c.json({ data: workspace });
      } catch (err) {
        console.error("createRow failed", err);
        return c.json({ error: "Failed to create workspace" }, 500);
      }
    }
  );

export default app;
