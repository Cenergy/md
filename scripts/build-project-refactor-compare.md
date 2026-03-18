# build-project.js 重构前后对比说明

## 目标与约束

- 目标：提升可读性、可维护性与执行效率
- 约束：不改变原有功能、构建流程、输出结构、命令行参数行为

## 主要改进点

### 1. 重复逻辑提取为独立函数

- 目录清理与重建：提取为 `resetDirectory`
- 路径规范化：提取为 `toPosixPath`
- 文件名清洗：提取为 `sanitizeFileName`
- 侧边栏链接计算：提取为 `buildSidebarLink`
- 菜单首页内容生成：提取为 `generateMenuIndexContent`
- 构建执行：提取为 `runVitePressBuild`
- 主题模板内容生成：提取为 `createThemeLayoutContent`、`createThemeIndexContent`

效果：避免重复代码，降低后续修改的扩散成本。

### 2. 变量命名优化

- `PROJECT_SOURCE_DIR` 等分散路径常量改为集中管理对象 `buildPaths`
- `safeName`、`menuSidebarItems` 等局部命名保持语义化并统一风格
- 将路径、内容处理、构建执行等职责通过命名明确分层

效果：阅读时更容易定位“数据来源”和“职责边界”。

### 3. 复杂逻辑拆解与简化

- 内容清洗拆解为多个小函数：
  - `normalizeSwiperIndent`
  - `escapeUnsafeTag`
  - `sanitizeNonCodePart`
  - `sanitizeContent`
- 菜单首个文档链接查找提取为 `findFirstSidebarLink`
- 构建主流程中“准备数据 / 生成配置 / 执行构建”步骤更清晰

效果：每个函数聚焦单一职责，降低认知负担与回归风险。

### 4. 必要注释补充

- 在主题布局模板中保留并补充关键注释，说明样式应用范围与观察器用途
- 通过分段函数名替代部分冗余解释性注释，减少注释与代码漂移风险

效果：关键行为可解释，同时避免过量注释造成噪音。

### 5. 风格一致性

- 统一函数结构与返回风格（早返回、单职责函数）
- 统一路径处理方式，避免同类逻辑分散实现
- 统一主流程组织方式，提高可测试性与可扩展性

效果：文件整体结构更稳定，后续演进更可控。

## 行为一致性说明

以下关键行为保持一致：

- `PROJECT_ID` 缺失时仍输出相同错误文案并终止流程
- API 获取失败时仍回退为默认项目信息与空菜单
- 菜单与文档生成路径规则保持一致
- VitePress 配置生成位置、字段结构与构建命令保持一致
- 主题加载与 Twikoo 初始化行为保持一致

## 验证记录

执行环境：项目根目录

1. 语法校验

- 命令：`node --check server/services/build-project.js`
- 结果：通过

2. 参数行为校验（缺失 `PROJECT_ID`）

- 命令：`node server/services/build-project.js`
- 结果：输出 `PROJECT_ID is required` 错误提示，行为符合原逻辑

3. 构建流程校验（显式传入 `PROJECT_ID`）

- 命令：`PROJECT_ID=default node server/services/build-project.js`
- 结果：在 API 不可达场景下按原有回退逻辑继续构建并完成 VitePress 打包

4. npm 脚本入口校验

- 命令：`PROJECT_ID=default npm run build:docs`
- 结果：构建成功，脚本入口行为一致

## 结论

本次重构在不改变功能的前提下，完成了结构化拆分、命名规范化、复杂逻辑降维与关键注释补充；并通过语法、参数行为、直接执行与 npm 脚本入口四类验证，确认原有构建流程与输出行为保持一致。
