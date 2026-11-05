import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";

const polygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
});

export async function gridRoutes(app: FastifyInstance) {
  app.get("/api/grids", async () => {
    return prisma.grid.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { persons: true } } },
    });
  });

  app.put("/api/grids/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as {
      bounds?: unknown;
      color?: string;
      name?: string;
    };

    const grid = await prisma.grid.findUnique({ where: { id } });
    if (!grid) {
      reply.code(404);
      return { error: "网格不存在" };
    }

    const data: Prisma.GridUpdateInput = {};

    if (body.bounds !== undefined) {
      const parsed = polygonSchema.safeParse(body.bounds);
      if (!parsed.success) {
        reply.code(400);
        return { error: "边界格式不合法", details: parsed.error.flatten() };
      }
      data.bounds = parsed.data as Prisma.InputJsonValue;
    }
    if (body.color) data.color = body.color;
    if (body.name) data.name = body.name;

    return prisma.grid.update({ where: { id }, data });
  });
}
