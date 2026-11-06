import {
  PrismaClient,
  Gender,
  PersonCategory,
  RiskLevel,
  PersonStatus,
  VisitMethod,
} from "@prisma/client";

const prisma = new PrismaClient();

const polygon = (ring: number[][]) => ({ type: "Polygon", coordinates: [ring] });

async function main() {
  await prisma.visit.deleteMany();
  await prisma.person.deleteMany();
  await prisma.grid.deleteMany();

  const gridDefs = [
    {
      name: "上河组",
      color: "#3E7C4F",
      sortOrder: 1,
      bounds: polygon([
        [114.244, 22.723],
        [114.248, 22.726],
        [114.252, 22.724],
        [114.251, 22.72],
        [114.246, 22.719],
        [114.243, 22.721],
        [114.244, 22.723],
      ]),
    },
    {
      name: "下河组",
      color: "#C9A227",
      sortOrder: 2,
      bounds: polygon([
        [114.258, 22.725],
        [114.263, 22.727],
        [114.267, 22.724],
        [114.265, 22.719],
        [114.26, 22.72],
        [114.256, 22.722],
        [114.258, 22.725],
      ]),
    },
    {
      name: "桥头组",
      color: "#5B7A8C",
      sortOrder: 3,
      bounds: polygon([
        [114.249, 22.715],
        [114.255, 22.717],
        [114.26, 22.713],
        [114.257, 22.709],
        [114.251, 22.71],
        [114.247, 22.712],
        [114.249, 22.715],
      ]),
    },
  ];

  const gridIds: Record<string, string> = {};
  for (const g of gridDefs) {
    const row = await prisma.grid.create({ data: g });
    gridIds[g.name] = row.id;
  }

  type PersonDef = {
    name: string;
    gender: Gender;
    birthDate: string;
    category: PersonCategory;
    grid: string;
    phone: string | null;
    guardianName?: string;
    address: string;
    riskLevel: RiskLevel;
    status: PersonStatus;
    notes: string;
  };

  const personDefs: PersonDef[] = [
    { name: "张桂兰", gender: Gender.FEMALE, birthDate: "1954-03-12", category: PersonCategory.ELDERLY_LIVING_ALONE, grid: "上河组", phone: "13812341246", address: "上河组12号", riskLevel: RiskLevel.HIGH, status: PersonStatus.NORMAL, notes: "独居，腿脚不便" },
    { name: "李建国", gender: Gender.MALE, birthDate: "1958-07-20", category: PersonCategory.EMPTY_NESTER, grid: "下河组", phone: "13912343578", address: "下河组5号", riskLevel: RiskLevel.MID, status: PersonStatus.NORMAL, notes: "慢性病，需定期查看用药" },
    { name: "王秀英", gender: Gender.FEMALE, birthDate: "1944-11-02", category: PersonCategory.ELDERLY_LIVING_ALONE, grid: "桥头组", phone: "13712349024", address: "桥头组3号", riskLevel: RiskLevel.HIGH, status: PersonStatus.PENDING_VISIT, notes: "高龄独居，需重点关注" },
    { name: "赵明德", gender: Gender.MALE, birthDate: "1950-05-18", category: PersonCategory.DISABLED, grid: "上河组", phone: "13612345617", address: "上河组20号", riskLevel: RiskLevel.LOW, status: PersonStatus.NORMAL, notes: "肢体残疾，生活可自理" },
    { name: "陈秀莲", gender: Gender.FEMALE, birthDate: "1960-09-30", category: PersonCategory.EMPTY_NESTER, grid: "下河组", phone: "13512348823", address: "下河组9号", riskLevel: RiskLevel.MID, status: PersonStatus.NORMAL, notes: "子女外出务工" },
    { name: "刘长贵", gender: Gender.MALE, birthDate: "1955-01-08", category: PersonCategory.ELDERLY_LIVING_ALONE, grid: "桥头组", phone: "13412347109", address: "桥头组7号", riskLevel: RiskLevel.HIGH, status: PersonStatus.PENDING_VISIT, notes: "独居，近期身体不适" },
    { name: "周玉兰", gender: Gender.FEMALE, birthDate: "1963-04-22", category: PersonCategory.EMPTY_NESTER, grid: "上河组", phone: "13312344468", address: "上河组18号", riskLevel: RiskLevel.LOW, status: PersonStatus.NORMAL, notes: "子女在县城工作" },
    { name: "吴启华", gender: Gender.MALE, birthDate: "1952-08-15", category: PersonCategory.DISABLED, grid: "下河组", phone: "13212346681", address: "下河组2号", riskLevel: RiskLevel.MID, status: PersonStatus.NORMAL, notes: "视力障碍，需陪护" },
    { name: "孙小乐", gender: Gender.MALE, birthDate: "2014-06-10", category: PersonCategory.LEFT_BEHIND_CHILD, grid: "上河组", phone: "13112340012", guardianName: "孙建国", address: "上河组22号", riskLevel: RiskLevel.MID, status: PersonStatus.NORMAL, notes: "父母在外务工，随祖父母生活" },
    { name: "黄佳怡", gender: Gender.FEMALE, birthDate: "2016-02-28", category: PersonCategory.LEFT_BEHIND_CHILD, grid: "下河组", phone: "13012340034", guardianName: "黄伟", address: "下河组15号", riskLevel: RiskLevel.LOW, status: PersonStatus.NORMAL, notes: "留守儿童，由外公外婆照看" },
  ];

  const personIds: Record<string, string> = {};
  for (const p of personDefs) {
    const { grid, birthDate, ...rest } = p;
    const row = await prisma.person.create({
      data: { ...rest, gridId: gridIds[grid], birthDate: new Date(birthDate) },
    });
    personIds[p.name] = row.id;
  }

  type VisitDef = {
    person: string;
    visitedAt: string;
    method: VisitMethod;
    visitor: string;
    summary: string;
    nextStep?: string;
  };

  const visitDefs: VisitDef[] = [
    { person: "张桂兰", visitedAt: "2025-10-28T09:30:00+08:00", method: VisitMethod.ON_SITE, visitor: "李网格员", summary: "身体状况稳定，询问饮食与用药情况", nextStep: "一周后电话回访" },
    { person: "张桂兰", visitedAt: "2025-10-21T15:00:00+08:00", method: VisitMethod.PHONE, visitor: "李网格员", summary: "精神状态良好，提醒注意天气变化", nextStep: "记录健康观察" },
    { person: "张桂兰", visitedAt: "2025-10-14T10:20:00+08:00", method: VisitMethod.ON_SITE, visitor: "王网格员", summary: "检查居家安全，协助整理药品", nextStep: "持续关注生活自理能力" },
    { person: "李建国", visitedAt: "2025-10-26T14:10:00+08:00", method: VisitMethod.PHONE, visitor: "李网格员", summary: "血压偏高，叮嘱按时服药", nextStep: "下周上门复测" },
    { person: "李建国", visitedAt: "2025-10-19T09:00:00+08:00", method: VisitMethod.ON_SITE, visitor: "李网格员", summary: "协助联系村医，确认慢病用药", nextStep: "关注用药情况" },
    { person: "王秀英", visitedAt: "2025-10-25T10:00:00+08:00", method: VisitMethod.ON_SITE, visitor: "王网格员", summary: "老人独居，情绪尚可，家中整洁", nextStep: "安排每周探访" },
    { person: "赵明德", visitedAt: "2025-10-24T16:30:00+08:00", method: VisitMethod.PHONE, visitor: "李网格员", summary: "生活自理正常，无需协助", nextStep: "" },
    { person: "陈秀莲", visitedAt: "2025-10-23T11:00:00+08:00", method: VisitMethod.ON_SITE, visitor: "李网格员", summary: "子女外出务工，情绪低落", nextStep: "组织邻里互助" },
  ];

  for (const v of visitDefs) {
    const { person, visitedAt, nextStep, ...rest } = v;
    await prisma.visit.create({
      data: {
        ...rest,
        personId: personIds[person],
        visitedAt: new Date(visitedAt),
        nextStep: nextStep && nextStep.length > 0 ? nextStep : null,
      },
    });
  }

  // 按最近一次走访刷新 lastVisitAt
  const persons = await prisma.person.findMany({ include: { visits: true } });
  for (const p of persons) {
    if (p.visits.length === 0) continue;
    const latest = p.visits.reduce((a, b) => (a.visitedAt > b.visitedAt ? a : b));
    await prisma.person.update({ where: { id: p.id }, data: { lastVisitAt: latest.visitedAt } });
  }

  console.log(
    `Seeded ${gridDefs.length} grids, ${personDefs.length} persons, ${visitDefs.length} visits.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
