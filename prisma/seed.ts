import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    id: "demo-tsering",
    name: "才仁",
    gender: "male",
    age: 26,
    city: "西宁",
    bio: "喜欢徒步阿尼玛卿，周末常去塔尔寺附近喝茶。想认识同城藏族朋友。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=tsering",
    wechatId: "tsering_xn26",
  },
  {
    id: "demo-dolma",
    name: "卓玛",
    gender: "female",
    age: 24,
    city: "西宁",
    bio: "在西宁上学，热爱藏语歌曲和唐卡。找一个能聊文化的人。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dolma",
    wechatId: "dolma_xn24",
  },
  {
    id: "demo-lobsang",
    name: "洛桑",
    gender: "male",
    age: 28,
    city: "西宁",
    bio: "在城东上班，周末喜欢打篮球。想约同城一起吃饭聊天。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=lobsang",
    wechatId: "lobsang_xn28",
  },
  {
    id: "demo-yangchen",
    name: "央金",
    gender: "female",
    age: 25,
    city: "西宁",
    bio: "喜欢拍照和逛博物馆，会一点藏文书法。同城见面优先。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=yangchen",
    wechatId: "yangchen_xn25",
  },
  {
    id: "demo-norbu",
    name: "诺布",
    gender: "male",
    age: 27,
    city: "西宁",
    bio: "从海南州来西宁工作，爱喝奶茶、听热巴。希望认识真诚的朋友。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=norbu",
    wechatId: "norbu_xn27",
  },
  {
    id: "demo-pema",
    name: "白玛",
    gender: "female",
    age: 23,
    city: "西宁",
    bio: "青海民族大学在读，喜欢跳锅庄。想找同城一起周末活动的人。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=pema",
    wechatId: "pema_xn23",
  },
  {
    id: "demo-sonam",
    name: "索南",
    gender: "male",
    age: 29,
    city: "西宁",
    bio: "开小店卖手工银饰，喜欢旅行。认真交友，不着急。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sonam",
    wechatId: "sonam_xn29",
  },
  {
    id: "demo-dekyi",
    name: "德吉",
    gender: "female",
    age: 26,
    city: "西宁",
    bio: "在医院工作，业余爱看藏语电影。同城见面喝杯茶就好。",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dekyi",
    wechatId: "dekyi_xn26",
  },
];

async function main() {
  await prisma.weChatRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.user.deleteMany();

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log(`Seeded ${users.length} users in 西宁`);
  console.log("Demo accounts: demo-tsering (才仁), demo-dolma (卓玛)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
