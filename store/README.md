# Domain Notes — Edge Add-ons 提交全套材料

本目录包含上架 **Microsoft Edge Add-ons** 商店所需的全部素材。

## 📁 目录结构

```
store/
├── privacy/
│   └── index.html              ★ 隐私政策，要传到 GitHub Pages
├── descriptions/
│   ├── title.txt               扩展名称
│   ├── short-zh.txt            短描述（中）
│   ├── short-en.txt            短描述（英）
│   ├── detailed-zh.md          详细描述（中）
│   ├── detailed-en.md          详细描述（英）
│   ├── permissions-zh.md       权限申请理由（中）
│   ├── search-terms.txt        搜索关键词
│   └── meta.txt                URL/Email 等元数据汇总
├── images/                     ★ 所有要传给 Edge 的 PNG
│   ├── logo-300.png            (300×300，必填)
│   ├── tile-440x280.png        (440×280，强烈推荐)
│   ├── tile-1400x560.png       (1400×560，强烈推荐)
│   ├── screenshot-1.png ~ 5    (1280×800，至少 1 张，最多 10 张)
│   └── src/                    SVG 源文件（要改文案/配色就改这里）
└── scripts/
    └── render-store-assets.js  改完 SVG 跑这个重新生成 PNG
```

---

## 🚀 提交流程（约 60 分钟）

### Step 1：替换占位符（5 分钟）

以下文件里出现 `<your-github-user>` 和 `<your-contact-email>`，全局搜索替换为你的真实信息：

```
store/privacy/index.html        — GitHub 链接 + 邮箱
store/descriptions/meta.txt     — GitHub Pages URL、Support URL、Privacy URL
```

例如 GitHub 用户名是 `alice`：
- `<your-github-user>` → `alice`
- `<your-contact-email>` → `alice@example.com`

### Step 2：上传到 GitHub 并开启 Pages（15 分钟）

```bash
# 进入项目根目录
cd "D:\Program Files\dev-project\domain-notes"

# 初始化 git（如果还没初始化）
git init
git add .
git commit -m "feat: domain-notes v1.1.0 with store assets"

# 在 GitHub 网页新建一个 repo 叫 domain-notes（公开仓库）
# 然后推送：
git remote add origin https://github.com/<你的用户名>/domain-notes.git
git branch -M main
git push -u origin main
```

开启 GitHub Pages：

1. 浏览器打开 `https://github.com/<你的用户名>/domain-notes/settings/pages`
2. **Source** 选 `Deploy from a branch`
3. **Branch** 选 `main`，**Folder** 选 `/store/privacy`（关键！只暴露隐私目录）

   > ⚠️ 如果 GitHub Pages 限制必须用 `/`、`/docs` 之类的根目录，复制 `store/privacy/index.html` 到项目根的 `docs/privacy.html`，然后 Pages 选 `/docs`，最终 URL 是 `https://<用户名>.github.io/domain-notes/privacy.html`

4. 保存后等 1-2 分钟，访问 `https://<你的用户名>.github.io/domain-notes/` 应该能看到隐私政策页

**记下这个 URL**——Edge 提交表单要填。

### Step 3：注册 Microsoft Partner Center（10 分钟，免费）

1. 打开 https://partner.microsoft.com/dashboard/microsoftedge/
2. 用任何微软账号登录（QQ 邮箱、Outlook、Gmail 都行）
3. 选择 **Individual developer** （个人开发者）
4. 填资料：法定姓名、地址、电话（**真实信息，会发短信验证**）
5. 提交，等待验证（一般几分钟～几小时）

> 不要担心地址会公开——Microsoft 会公开的只有你设置的"开发者显示名"，不会公开真实姓名地址。

### Step 4：打包扩展（2 分钟）

```bash
cd "D:\Program Files\dev-project\domain-notes"
npm run build
```

把 `dist/` 文件夹打成 zip：

```powershell
Compress-Archive -Path dist\* -DestinationPath domain-notes-v1.1.0.zip -Force
```

或者用 7-zip / WinRAR。**注意：要把 dist 内的文件压缩，不是把 dist 文件夹压缩进去。**

> Edge 提交需要的是 zip 文件，不是 CRX。

### Step 5：在 Partner Center 提交（20 分钟）

1. 进入 Partner Center → Microsoft Edge → **Create new extension**
2. **Package** 上传：`domain-notes-v1.1.0.zip`
3. **Availability**：
   - 选地区（建议先选所有地区 *Make this extension available in all markets*）
4. **Properties**：
   - Category: `Productivity`
5. **Listing** → 选 `Chinese (Simplified)` 作为默认语言，并添加 `English (United States)`

   **中文 listing**：
   - **Name**: 复制 `descriptions/title.txt` 内容
   - **Short description**: 复制 `descriptions/short-zh.txt`
   - **Detailed description**: 复制 `descriptions/detailed-zh.md`
   - **Search terms**: 复制 `descriptions/search-terms.txt`
   - **Logo**: 上传 `images/logo-300.png`
   - **Store logo**: 同上 logo-300.png 即可
   - **Small promotional tile**: 上传 `images/tile-440x280.png`
   - **Large promotional tile**: 上传 `images/tile-1400x560.png`
   - **Screenshots**: 上传 5 张 `images/screenshot-1.png` ~ `screenshot-5.png`
   - **Privacy policy URL**: 填上一步的 GitHub Pages URL
   - **Website**: 同上 GitHub Pages URL
   - **Support contact info**: 填你的 GitHub Issues URL 或邮箱

   **英文 listing**（如果选了多语言）：用 `short-en.txt` 和 `detailed-en.md`，其他素材通用。

6. **Permissions justification**（如果系统要求）：
   - 复制 `descriptions/permissions-zh.md` 的内容粘贴
   - 重点说明：所有数据**仅本地存储**

7. **Submit for review** 👉 一键提交

### Step 6：等待审核（1-7 天）

- 状态可以在 Partner Center 看到
- 大概率会通过——我们的扩展非常合规：
  - ✅ 纯本地存储
  - ✅ 无远程代码
  - ✅ 权限最小化
  - ✅ 隐私政策完整
- 如果被退回，邮件会说明原因；按提示改了重提即可

---

## 🔄 改了 SVG 想重新生成 PNG

```bash
cd "D:\Program Files\dev-project\domain-notes"
node store/scripts/render-store-assets.js
```

8 张 PNG 全部刷新，覆盖原文件。

---

## 📊 各素材尺寸对照

| 文件 | 用途 | 尺寸 | 必填 |
|------|------|------|------|
| `logo-300.png` | 商店 Logo | 300×300 | ✅ |
| `tile-440x280.png` | Small promo tile（搜索结果展示） | 440×280 | 强烈推荐 |
| `tile-1400x560.png` | Large promo tile / Hero | 1400×560 | 强烈推荐 |
| `screenshot-*.png` | 详情页截图 | 1280×800 | 至少 1 张 |

---

## 🐛 常见问题

**Q: 提交时报"manifest version not supported"？**
确认是 MV3（manifest_version: 3），我们已经是。如果还报错，把 `manifest.json` 里的 `version` 数字递增一下（比如 1.1.0 → 1.1.1）重新打包。

**Q: 截图被判为"低质量"被退回？**
我们的截图都是 1280×800 PNG 高清渲染，标准来说不会被退。如果真被退，看下退回邮件的具体原因，可能是被"图片中文字太多"判定为图片广告——这种情况选 3 张文字最少的（screenshot-3 / 5）提交。

**Q: 描述里写"100% 本地存储"会被认为是营销夸大吗？**
不会，因为这是事实——所有数据确实在 `chrome.storage.local`。但描述里我已经避免用绝对化用语，用的是"纯本地存储"、"不上传"。

**Q: 隐私政策 URL 必须用 HTTPS 吗？**
是的。GitHub Pages 默认就是 HTTPS，没问题。

**Q: 我没有信用卡 / 国外手机能注册 Partner Center 吗？**
中国大陆手机+QQ邮箱 完全可以，亲测可用。注册不需要任何付费。

---

## 🔮 后续

- **想发 Chrome Web Store**: 用同一份 zip，去 https://chrome.google.com/webstore/devconsole（要付 $5 一次性注册费）
- **想发 Firefox**: 需要小改代码（`chrome.*` → `browser.*` 或加 webextension-polyfill）

发布后记得在 README 加上商店徽章，效果更专业。

---

祝上架顺利 🚀
