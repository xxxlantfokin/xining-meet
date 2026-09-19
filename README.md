# 西宁遇见 · Xining Meet

同城藏族滑动交友 MVP（西宁）。轻量认识 → 互赞匹配 → 站内聊天 → 复制微信号跳转微信。

**不是**婚介重模式：无朋友圈、无群聊、无语音房、无礼物、无重 KYC。无需短信即可本地演示。

## 技术栈

- Next.js 14 (App Router) + TypeScript + Tailwind
- Prisma + SQLite（`prisma/dev.db`）
- Cookie 会话（演示账号一键登录）

## 快速开始

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

生产构建：

```bash
npm run build
npm start
```

## 验收路径（本地无短信）

种子数据含 ≥6 名西宁演示用户。建议用这两个账号完成互赞：

| 账号 ID | 姓名 | 微信号 |
|---------|------|--------|
| `demo-tsering` | 才仁 | `tsering_xn26` |
| `demo-dolma` | 卓玛 | `dolma_xn24` |

### 步骤

1. 打开站点 → 登录页选择 **才仁**。
2. 在「发现」对 **卓玛** 点 ♥（喜欢）。
3. 点右上角语言旁可切换 **中文 / བོད་ཡིག**（藏语标签为占位/简写，切换必须可用）。
4. 退出：清除 cookie 或直接再打开登录页，选 **卓玛** 登录。
5. 在「发现」对 **才仁** 点 ♥ → 出现互赞弹窗。
6. 进入聊天，发送一条消息。
7. 在聊天顶栏或「匹配」页点击 **复制微信号**，应得到 `tsering_xn26`。

重置数据：

```bash
npm run db:reset
```

## 空状态

- 发现页：滑完所有人后显示空状态提示。
- 消息 / 匹配页：无匹配时显示引导去发现页。

## 数据模型（v1）

- `User`：资料 + `wechatId`（仅匹配后对对方可见）
- `Swipe`：like / pass
- `Match`：互赞后创建
- `Thread`：每个 Match 一条会话
- `Message`：站内消息

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run db:push` | 同步 Prisma schema 到 SQLite |
| `npm run db:seed` | 写入演示用户 |
| `npm run db:reset` | 清空并重新种子 |

## 推送到 GitHub

本仓库已本地 `git init` 并含初始提交。添加远程后推送即可：

```bash
git remote add origin git@github.com:<you>/xining-meet.git
git push -u origin main
```

注意：`.env` 与 `prisma/dev.db` 已在 `.gitignore` 中；克隆后需重新 `db:push` + `db:seed`。
