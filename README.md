# OR Media Console Planning Kit / 数字化手术室媒体控制系统规划文档包

> English follows Chinese.

## 中文

这是一个面向“数字化手术室媒体控制系统”的公开规划文档包。它展示了如何利用 Codex 将行业经验、设备集成经验和现场工程经验，转化为可开发、可测试、可交付的软件工程资产。

本仓库不包含任何原始厂商说明书、真实患者数据、生产配置、密钥或第三方厂商可识别信息。所有第三方厂商名称已做脱敏处理，仅保留能力归纳和工程方法。

### 适合谁阅读

- 有丰富行业经验，想把经验产品化的创业者或产品负责人。
- 医疗、工业、政企、金融等复杂系统的软件项目负责人。
- 希望更高效使用 Codex 进行需求拆解、架构设计、测试规划和交付管理的工程团队。
- 想了解“先建立工程体系，再进入编码”的实践者。

### 这个仓库解决什么问题

很多项目启动时只靠一句自然语言需求，例如“做一个数字化手术室系统”。这种方式前期看似很快，后期往往会遇到范围不清、接口反复、测试无依据、安全风险后置、上线条件不明确等问题。

本仓库采用更工程化的做法：

1. 先分析已脱敏说明资料和同类系统能力。
2. 将经验拆解为 PRD、SRS、架构、接口、安全、风险、测试、部署、培训和上线检查文档。
3. 用 `FR-xxx`、`RISK-xxx`、`TC-xxx`、`REL-xxx` 建立需求、风险、测试和发布追踪关系。
4. 使用 Codex 作为工程协作工具，持续维护文档、检查遗漏、辅助后续开发。

### 文档目录

- `apps/api/`：Sprint 0 后端 API 骨架
- `apps/web/`：Sprint 0 前端控制台骨架
- `packages/shared/`：共享设备拓扑、类型和校验逻辑
- `docs/dev/`：开发启动和工程实施记录
- `docs/prelaunch/00_文档清单与使用说明.md`
- `docs/prelaunch/01_资料来源与竞品调研.md`
- `docs/prelaunch/02_PRD_产品需求文档.md`
- `docs/prelaunch/03_SRS_软件需求规格说明书.md`
- `docs/prelaunch/04_系统架构与接口设计.md`
- `docs/prelaunch/05_安全隐私合规与风险管理.md`
- `docs/prelaunch/06_项目计划_WBS_里程碑.md`
- `docs/prelaunch/07_测试验证与验收计划.md`
- `docs/prelaunch/08_部署运维培训与用户手册.md`
- `docs/prelaunch/09_追踪矩阵与开放检查清单.md`
- `docs/prelaunch/10_Codex工程协作指南.md`
- `docs/prelaunch/11_系统功能汇总与需求分析报告.md`
- `docs/prelaunch/12_质量配置变更与发布管理计划.md`
- `docs/prelaunch/13_设备清单与电气连接设计.md`
- `docs/prelaunch/14_MVP开发任务清单.md`
- `docs/prelaunch/15_技术实施路线图.md`
- `AGENTS.md`
- `ANONYMIZATION.md`
- `CONTRIBUTING.md`
- `SECURITY.md`

### 使用建议

从 `docs/prelaunch/00_文档清单与使用说明.md` 开始阅读。若你希望把自己的工程经验产品化，可以先参考 `02_PRD`、`03_SRS` 和 `10_Codex工程协作指南`，再根据自己的行业场景替换功能域、风险项和验收标准。

进入开发阶段时，可阅读 `docs/dev/SPRINT_0_ENGINEERING_BOOTSTRAP.md`、`docs/dev/SPRINT_1_TOPOLOGY_CONFIGURATION.md` 和 `docs/dev/SPRINT_2_VIDEO_ROUTING.md`，并从以下命令启动：

```powershell
pnpm install
pnpm test
pnpm build
pnpm dev
```

### 重要声明

本仓库仅用于软件工程方法、项目计划和需求分析示例，不构成医疗器械注册、临床使用、采购或合规结论。任何真实项目落地前，都需要结合目标市场法规、医院制度、现场设备、网络条件和专业法律/合规意见重新评估。

---

## English

This repository is a public planning kit for a digital operating-room media control system. It demonstrates how Codex can help convert domain expertise, device-integration knowledge, and field engineering experience into software-engineering assets that are buildable, testable, and deliverable.

This repository does not include original vendor manuals, real patient data, production configuration, secrets, or identifiable third-party vendor information. All third-party vendor names have been anonymized. Only capability summaries and engineering methods are retained.

### Who This Is For

- Founders and product owners who want to turn deep industry experience into software products.
- Project leads working on complex systems in healthcare, industrial, government, enterprise, or financial domains.
- Engineering teams that want to use Codex more effectively for requirements, architecture, testing, and delivery planning.
- Practitioners who believe robust software starts with an engineering system, not just code.

### What Problem It Solves

Many projects start from a single natural-language request such as “build a digital operating-room system.” That may feel fast at first, but it often leads to unclear scope, repeated interface changes, weak test criteria, delayed security review, and vague release gates.

This repository uses a more disciplined workflow:

1. Analyze anonymized source material and peer-system capabilities.
2. Convert experience into PRD, SRS, architecture, interface, security, risk, testing, deployment, training, and release-gate documents.
3. Use `FR-xxx`, `RISK-xxx`, `TC-xxx`, and `REL-xxx` identifiers to connect requirements, risks, tests, and release readiness.
4. Use Codex as an engineering collaborator to maintain documents, find gaps, and support future implementation.

### Repository Structure

- `apps/api/` contains the Sprint 0 backend API skeleton.
- `apps/web/` contains the Sprint 0 web console skeleton.
- `packages/shared/` contains shared topology types, seed data, and validation logic.
- `docs/dev/` contains engineering bootstrap notes.
- `docs/prelaunch/` contains the pre-release documentation package.
- `AGENTS.md` defines repository-level Codex collaboration rules.
- `ANONYMIZATION.md` explains the anonymization scope.
- `CONTRIBUTING.md` explains contribution expectations.
- `SECURITY.md` explains how to handle sensitive information.

### How To Use

Start with `docs/prelaunch/00_文档清单与使用说明.md`. If you are productizing your own engineering experience, review `02_PRD`, `03_SRS`, and `10_Codex工程协作指南`, then replace the functional domains, risks, and acceptance criteria with your own domain context.

For implementation planning, continue with `14_MVP开发任务清单.md` and `15_技术实施路线图.md`. They translate the documentation package into executable MVP tasks and a first technical roadmap.

For the runnable engineering skeleton, topology configuration, and video routing increments, read `docs/dev/SPRINT_0_ENGINEERING_BOOTSTRAP.md`, `docs/dev/SPRINT_1_TOPOLOGY_CONFIGURATION.md`, and `docs/dev/SPRINT_2_VIDEO_ROUTING.md`, then run `pnpm install`, `pnpm test`, `pnpm build`, and `pnpm dev`.

### Disclaimer

This repository is an example of software-engineering planning and requirements analysis. It is not a medical-device registration file, clinical-use instruction, procurement recommendation, or legal/compliance opinion. Any real-world implementation must be reassessed against target-market regulations, hospital policies, field devices, network conditions, and professional legal/compliance advice.
