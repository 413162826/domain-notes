# 权限申请理由（Edge 提交表单"Permissions justification"字段直接复制）

## storage
保存用户的笔记内容（Markdown 文档 + 粘贴图片）到浏览器本地存储。这是扩展最核心的功能，没有此权限无法记录任何笔记。

## unlimitedStorage
解除 chrome.storage.local 默认 10 MB 的容量限制。用户粘贴截图时图片以 base64 形式内嵌存储，多张图片会迅速占满 10 MB。所有数据仍仅保存在本地，不上传服务器。

## activeTab
当用户点击扩展图标时，读取当前活动标签页的 URL 和标题，用途：
1. 通过 URL 解析 eTLD+1 域名（如 docs.github.com → github.com），加载对应的笔记本；
2. "插入当前页面引用"功能：将当前页面标题和 URL 作为引用块插入笔记。

URL 和标题数据完全停留在用户本地，不发送到任何服务器。activeTab 权限只在用户主动点击扩展时生效，符合最小权限原则。

## favicon
通过 Chrome 提供的 `chrome-extension://<id>/_favicon/` API 读取浏览器本地缓存的网站图标，在"所有笔记"视图中每张笔记卡片旁显示对应网站的 favicon。此 API 仅访问浏览器本地缓存，不发起任何网络请求。
