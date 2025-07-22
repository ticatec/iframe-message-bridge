# iframe-message-bridge

一个轻量级的 TypeScript 库，基于 `postMessage` 实现父页面与多个 iframe 之间的结构化、可靠通信，支持单向消息、请求-响应模式和广播消息，自动追踪消息并校验来源。

---

## 📦 特性

- ✅ 支持 **父页面与 iframe 之间的单向或双向通信**
- 🔁 **请求-响应通信**，使用 `Promise` 封装
- 📡 **广播消息**：父页面可向所有 iframe 同时发送消息
- 🧩 **支持多个 iframe**：父页面可区分每个 iframe 的消息来源
- 🔄 **自动发现 iframe**：无需手动注册，自动扫描页面中的所有 iframe
- 🔐 **安全通信**：仅响应受信任的来源（origin）
- 🧼 无依赖，轻量高效

---

## 🚀 安装

```bash
npm install @ticatec/iframe-message-bridge
```

---

## 🧠 工作原理

* `MessageBridgeManager` — 用于 **父页面**，接收 iframe 发来的消息并响应，同时可向所有 iframe 广播消息
* `MessageBridgeClient` — 用于 **iframe 中**，向父页面发送消息、等待响应，以及接收广播消息

---

## 🔧 使用示例

### 在父页面中

```ts
import { MessageBridgeManager } from 'iframe-message-bridge';

const bridge = new MessageBridgeManager();

// 注册请求-响应事件处理器
bridge.on('getUserInfo', (data, sourceWindow, sourceOrigin) => {
  console.log('收到来自 iframe 的数据:', data);
  return { name: 'Alice', role: 'admin' };
});

// 注册广播消息处理器（可选，父页面也能接收广播）
bridge.onBroadcast('system-notification', (data) => {
  console.log('收到系统通知:', data);
});

// 向所有 iframe 广播消息
bridge.broadcast('user-login', { 
  userId: 123, 
  userName: 'Alice',
  timestamp: Date.now()
});

// 广播主题变更
bridge.broadcast('theme-change', { theme: 'dark' });
```

---

### 在 iframe 中

```ts
import { MessageBridgeClient } from 'iframe-message-bridge';

const bridge = new MessageBridgeClient('https://your-parent-domain.com');

// 发起请求并等待响应
bridge.emit('getUserInfo', { id: 123 }).then(response => {
  console.log('收到来自父页面的响应:', response);
});

// 发送单向消息（不需要响应）
bridge.send('logEvent', { action: 'opened-page' });

// 监听父页面的广播消息
bridge.onBroadcast('user-login', (data) => {
  console.log('用户登录广播:', data);
  updateUserInfo(data);
});

bridge.onBroadcast('theme-change', (data) => {
  console.log('主题变更广播:', data);
  applyTheme(data.theme);
});

// 取消监听特定广播事件
bridge.offBroadcast('theme-change');

// 清空所有广播监听器
bridge.clearBroadcastHandlers();
```

---

## 📌 API 参考

### `MessageBridgeManager`（父页面）

#### `new MessageBridgeManager()`

初始化桥接器，注册全局 `message` 事件监听。

#### `.on(eventName: string, handler: (data, sourceWindow, sourceOrigin) => any)`

注册请求-响应事件处理器，当某个 iframe 发送该事件名的消息时被触发，可返回数据作为响应。

#### `.onBroadcast(eventName: string, handler: (data) => void)`

注册广播消息处理器，当接收到广播消息时被触发（可选功能）。

#### `.broadcast(eventName: string, data: any, targetOrigin?: string)`

向页面中所有 iframe 发送广播消息。会自动扫描并获取当前页面的所有 iframe。

- `eventName`: 事件名称
- `data`: 要发送的数据
- `targetOrigin`: 目标域名，默认为 `'*'`

---

### `MessageBridgeClient`（iframe 页面）

#### `new MessageBridgeClient(targetOrigin: string)`

创建客户端实例，指定父页面的 origin（例如 `'https://example.com'`）

#### `.emit(eventName: string, data?: any): Promise<any>`

发送一个请求类型的消息，并等待父页面响应。

#### `.send(eventName: string, data?: any): void`

发送一个单向消息，不等待响应。

#### `.onBroadcast(eventName: string, handler: (data) => void)`

注册广播消息处理器，监听来自父页面的广播消息。

#### `.offBroadcast(eventName: string)`

取消注册特定的广播消息处理器。

#### `.clearBroadcastHandlers()`

清空所有广播消息处理器。

---

## 🌟 通信模式

### 1. 请求-响应模式（iframe → 父页面）

```ts
// iframe 中
const result = await bridge.emit('getData', { id: 123 });

// 父页面中  
bridge.on('getData', (data) => {
  return fetchDataById(data.id);
});
```

### 2. 单向消息（iframe → 父页面）

```ts
// iframe 中
bridge.send('analytics', { event: 'page_view' });

// 父页面中
bridge.on('analytics', (data) => {
  trackEvent(data.event);
  // 无需返回值
});
```

### 3. 广播消息（父页面 → 所有 iframe）

```ts
// 父页面中
bridge.broadcast('global-update', { version: '2.0' });

// 所有 iframe 中
bridge.onBroadcast('global-update', (data) => {
  console.log('收到全局更新:', data.version);
});
```

---

## 🛡️ 安全建议

* **务必在父页面中校验 `event.origin`**，以防止恶意 iframe 攻击。
* **避免在生产中使用 `"*"` 作为 `targetOrigin`**，请指定明确域名。
* 推荐给 iframe 添加 `sandbox` 属性并限制权限。
* 对于敏感数据的广播，建议在 iframe 中验证消息来源。

---

## 🔄 自动 iframe 发现

库会自动扫描页面中的所有 `<iframe>` 元素，无需手动注册：

```ts
// 父页面中，这些 iframe 都会自动接收广播消息
// <iframe src="module1.html"></iframe>
// <iframe src="module2.html"></iframe>
// <iframe src="module3.html"></iframe>

bridge.broadcast('config-update', newConfig); // 所有 iframe 都会收到
```

动态添加的 iframe 也会在下次广播时被自动发现。

---

## 📜 许可证

[MIT](./LICENSE)

---

## ✨ 作者

由 Henry Feng 开发  
huili.f@gmail.com