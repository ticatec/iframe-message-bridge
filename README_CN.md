# iframe-message-bridge

一个轻量级的 TypeScript 库，基于 `postMessage` 实现父页面与多个 iframe 之间的结构化、可靠通信，支持单向消息和请求-响应模式，自动追踪消息并校验来源。

---

## 📦 特性

- ✅ 支持 **父页面与 iframe 之间的单向或双向通信**
- 🔁 **请求-响应通信**，使用 `Promise` 封装
- 🧩 **支持多个 iframe**：父页面可区分每个 iframe 的消息来源
- 🔐 **安全通信**：仅响应受信任的来源（origin）
- 🧼 无依赖，轻量高效

---

## 🚀 安装

```bash
npm install @ticatec/iframe-message-bridge
````

---

## 🧠 工作原理

* `MessageBridgeManager` — 用于 **父页面**，接收 iframe 发来的消息并响应
* `MessageBridgeClient` — 用于 **iframe 中**，向父页面发送消息，并可等待响应

---

## 🔧 使用示例

### 在父页面中

```ts
import { MessageBridgeManager } from 'iframe-message-bridge';

const bridge = new MessageBridgeManager();

// 注册事件处理器
bridge.on('getUserInfo', (data, sourceWindow, sourceOrigin) => {
  console.log('收到来自 iframe 的数据:', data);
  return { name: 'Alice', role: 'admin' };
});
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
```

---

## 📌 API 参考

### `MessageBridgeManager`（父页面）

#### `new MessageBridgeManager()`

初始化桥接器，注册全局 `message` 事件监听。

#### `.on(eventName: string, handler: (data, sourceWindow, sourceOrigin) => any)`

注册事件处理器，当某个 iframe 发送该事件名的消息时被触发，可返回数据作为响应。

---

### `MessageBridgeClient`（iframe 页面）

#### `new MessageBridgeClient(targetOrigin: string)`

创建客户端实例，指定父页面的 origin（例如 `'https://example.com'`）

#### `.emit(eventName: string, data?: any): Promise<any>`

发送一个请求类型的消息，并等待父页面响应。

#### `.send(eventName: string, data?: any): void`

发送一个单向消息，不等待响应。

---

## 🛡️ 安全建议

* **务必在父页面中校验 `event.origin`**，以防止恶意 iframe 攻击。
* **避免在生产中使用 `"*"` 作为 `targetOrigin`**，请指定明确域名。
* 推荐给 iframe 添加 `sandbox` 属性并限制权限。
---

## 📜 许可证

[MIT](./LICENSE)

---

## ✨ 作者

由 Henry Feng 开发  
huili.f@gmail.com

```

