import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import z from "zod";
import { createProjectSchema, updateProjectSchema } from "../schema";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user");
      const tables = c.get("tables");

      const { workspaceId } = c.req.valid("query");

      if (!workspaceId) {
        return c.json({ error: "workspaceId is required" }, 400);
      }

      const member = await getMember({
        tables,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "You are not a member of this workspace" }, 401);
      }

      const projects = await tables.listRows(DATABASE_ID, PROJECTS_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ]);

      return c.json({
        data: projects,
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const tables = c.get("tables");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image, workspaceId } = c.req.valid("form");

      if (!workspaceId) {
        return c.json({ error: "workspaceId is required" }, 400);
      }

      const member = await getMember({
        tables,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "You are not a member of this workspace" }, 401);
      }

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
        const project = await tables.createRow({
          databaseId: DATABASE_ID,
          tableId: PROJECTS_ID,
          rowId: ID.unique(),
          data: {
            name,
            imageUrl: uploadedImageUrl,
            workspaceId,
          },
        });

        return c.json({ data: project });
      } catch (err) {
        console.error("createRow failed", err);
        return c.json({ error: "Failed to create project" }, 500);
      }
    }
  )
  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const tables = c.get("tables");
      const storage = c.get("storage");
      const user = c.get("user");
      const { projectId } = c.req.param();

      const { name, image } = c.req.valid("form");

      const existingProject = await tables.getRow<any>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      const member = await getMember({
        tables,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

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
      } else {
        uploadedImageUrl = image;
      }

      const project = await tables.updateRow(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      );

      return c.json({ data: project });
    }
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const tables = c.get("tables");
    const user = c.get("user");
    const { projectId } = c.req.param();

    const existingProject = await tables.getRow<any>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({
      tables,
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });
    if (!member) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    await tables.deleteRow(DATABASE_ID, PROJECTS_ID, projectId);

    return c.json({
      data: { $id: existingProject.$id },
    });
  })
  .get("/:projectId", sessionMiddleware, async (c) => {
    const tables = c.get("tables");
    const user = c.get("user");

    const { projectId } = c.req.param();

    const project = await tables.getRow<any>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({
      tables,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json(
        {
          error: "You are not a member of this workspace",
        },
        401
      );
    }

    return c.json({ data: project });
  });

export default app;
