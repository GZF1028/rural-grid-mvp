import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { PersonStatus, VisitMethod } from "@prisma/client";
import { prisma } from "../db";

const visitBody = z.object({
  visitedAt: z.string().min(1, "走访时间不能为空"),
  method: z.nativeEnum(VisitMethod),
  visitor: z.string().trim().min(1, "走访人不能为空"),
  summary: z.string().trim().min(1, "情况摘要不能为空"),
  nextStep: z.string().trim().optional().nullable(),
});

export async function visitRoutes(app: FastifyInstance) {
  app.get("/api/persons/:id/visits", async (req, reply) => {
    const { id } = req.params as { id: string };
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) {
      reply.code(404);
      return { error: "档案不存在" };
    }
    return prisma.visit.findMany({
      where: { personId: id },
      orderBy: { visitedAt: "desc" },
    });
  });

  app.post("/api/persons/:id/visits", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = visitBody.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: "表单校验失败", details: parsed.error.flatten() };
    }
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) {
      reply.code(404);
      return { error: "档案不存在" };
    }

    const data = parsed.data;
    const created = await prisma.visit.create({
      data: {
        personId: id,
        visitedAt: new Date(data.visitedAt),
        method: data.method,
        visitor: data.visitor,
        summary: data.summary,
        nextStep: data.nextStep && data.nextStep.length > 0 ? data.nextStep : null,
      },
    });

    // 闭环：刷新最近走访时间；若原状态为「待走访」则转为「正常」
    const latest = await prisma.visit.findFirst({
      where: { personId: id },
      orderBy: { visitedAt: "desc" },
    });
    await prisma.person.update({
      where: { id },
      data: {
        lastVisitAt: latest?.visitedAt ?? null,
        status:
          person.status === PersonStatus.PENDING_VISIT
            ? PersonStatus.NORMAL
            : person.status,
      },
    });

    return created;
  });
}
