# Domain Notes

每个网站域名一个 Markdown 笔记本，纯本地存储。

## 构建

```bash
npm install
npm run build      # 生成 dist/
npm run pack       # 生成 dist/ + domain-notes.crx + domain-notes.zip
```

## 安装

**推荐：加载已解压的扩展程序**

1. 打开 `chrome://extensions`
2. 右上角打开"开发者模式"
3. 点击"加载已解压的扩展程序"，选择 `dist/` 文件夹

CRX 文件 (`domain-notes.crx`) 在大多数 Chrome/Edge 上会被拦截（出于安全考虑）；如果你的浏览器允许，可以直接拖入。

## 快捷键

| 快捷键 | 作用 |
|--------|------|
| `Ctrl+1` ~ `Ctrl+6` | 标题 1~6 |
| `Ctrl+B` / `Ctrl+I` | 加粗 / 斜体 |
| `Ctrl+L` | 无序列表 |
| `Ctrl+Shift+L` | 有序列表 |
| `Ctrl+Shift+T` | 任务列表 |
| `Ctrl+Shift+B` | 引用 |
| `Ctrl+Shift+C` | 代码块 |
| `Ctrl+K` | 插入链接 |
| `Ctrl+Shift+H` | 分割线 |
| `Ctrl+/` | 切换"所有笔记" |

## 输入触发

| 输入 | 触发 |
|------|------|
| `# ` ~ `###### ` | 标题 |
| `- ` 或 `* ` | 无序列表 |
| `1. ` | 有序列表 |
| `> ` | 引用 |
| ` ``` ` | 代码块 |
| ` ` `行内代码` ` ` ` | 行内代码 |
| `**粗体**` | 粗体 |
| `*斜体*` | 斜体 |
| `---` | 分割线 |

## 粘贴图片

直接 `Ctrl+V` 粘贴或拖拽，自动转 base64 内嵌。
