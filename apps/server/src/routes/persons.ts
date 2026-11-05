import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  Gender,
  PersonCategory,
  PersonStatus,
  Prisma,
  RiskLevel,
} from "@prisma/client";
import { prisma } from "../db";

const listQuery = z.object({
  q: z.string().optional(),
  gridId: z.string().optional(),
  riskLevel: z.nativeEnum(RiskLevel).optional(),
  category: z.nativeEnum(PersonCategory).optional(),
  status: z.nativeEnum(PersonStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

const personBody = z.object({
  name: z.string().trim().min(1, "姓名不能为空"),
  gender: z.nativeEnum(Gender),
  birthDate: z.string().optional().nullable(),
  category: z.nativeEnum(PersonCategory),
  gridId: z.string().min(1, "请选择网格"),
  phone: z.string().trim().optional().nullable(),
  guardianName: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  riskLevel: z.nativeEnum(RiskLevel),
  status: z.nativeEnum(PersonStatus),
  notes: z.string().trim().optional().nullable(),
});

const PHONE_RE = /^1[3-9]\d{9}$/;

function validatePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  if (!PHONE_RE.test(phone)) throw new Error("手机号格式不正确");
  return phone;
}

export async function personRoutes(app: FastifyInstance) {
  app.get("/api/persons", async (req, reply) => {
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
      reply.code(400);
      return { error: "查询参数不合法", details: parsed.error.flatten() };
    }
    const { q, gridId, riskLevel, category, status, page, pageSize } =
      parsed.data;

    const where: Prisma.PersonWhereInput = {};
    if (gridId) where.gridId = gridId;
    if (riskLevel) where.riskLevel = riskLevel;
    if (category) where.category = category;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.person.count({ where }),
      prisma.person.findMany({
        where,
        include: { grid: true },
        orderBy: [{ lastVisitAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { items, total, page, pageSize };
  });

  app.get("/api/persons/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        grid: true,
        visits: { orderBy: { visitedAt: "desc" } },
      },
    });
    if (!person) {
      reply.code(404);
      return { error: "档案不存在" };
    }
    return person;
  });

  app.post("/api/persons", async (req, reply) => {
    const parsed = personBody.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: "表单校验失败", details: parsed.error.flatten() };
    }
    const data = parsed.data;
    if (data.category === PersonCategory.LEFT_BEHIND_CHILD && !data.guardianName) {
      reply.code(400);
      return { error: "留守儿童必须填写监护人姓名" };
    }
    let phone: string | null;
    try {
      phone = validatePhone(data.phone);
    } catch {
      reply.code(400);
      return { error: "手机号格式不正确" };
    }
    const created = await prisma.person.create({
      data: {
        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        category: data.category,
        gridId: data.gridId,
        phone,
        guardianName: data.guardianName || null,
        address: data.address || null,
        riskLevel: data.riskLevel,
        status: data.status,
        notes: data.notes || null,
      },
    });
    return created;
  });

  app.put("/api/persons/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = personBody.safeParse(req.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: "表单校验失败", details: parsed.error.flatten() };
    }
    const data = parsed.data;
    if (data.category === PersonCategory.LEFT_BEHIND_CHILD && !data.guardianName) {
      reply.code(400);
      return { error: "留守儿童必须填写监护人姓名" };
    }
    const existing = await prisma.person.findUnique({ where: { id } });
    if (!existing) {
      reply.code(404);
      return { error: "档案不存在" };
    }
    let phone: string | null;
    try {
      phone = validatePhone(data.phone);
    } catch {
      reply.code(400);
      return { error: "手机号格式不正确" };
    }
    const updated = await prisma.person.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        category: data.category,
        gridId: data.gridId,
        phone,
        guardianName: data.guardianName || null,
        address: data.address || null,
        riskLevel: data.riskLevel,
        status: data.status,
        notes: data.notes || null,
      },
    });
    return updated;
  });
}
