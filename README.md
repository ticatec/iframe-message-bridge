# iframe-message-bridge

A lightweight TypeScript library that implements structured, reliable communication between parent pages and multiple iframes based on `postMessage`, supporting one-way messages, request-response patterns, and broadcast messages with automatic message tracking and origin validation.

---

## 📦 Features

- ✅ Support for **one-way or two-way communication between parent page and iframes**
- 🔁 **Request-response communication** with `Promise` encapsulation
- 📡 **Broadcast messages**: Parent page can send messages to all iframes simultaneously
- 🧩 **Multiple iframe support**: Parent page can distinguish message sources from each iframe
- 🔄 **Auto iframe discovery**: No manual registration required, automatically scans all iframes in the page
- 🔐 **Secure communication**: Only responds to trusted origins
- 🧼 Zero dependencies, lightweight and efficient

---

## 🚀 Installation

```bash
npm install @ticatec/iframe-message-bridge
```

---

## 🧠 How It Works

* `MessageBridgeManager` — Used in the **parent page** to receive messages from iframes and respond, while also broadcasting messages to all iframes
* `MessageBridgeClient` — Used in **iframes** to send messages to parent page, wait for responses, and receive broadcast messages

---

## 🔧 Usage Examples

### In Parent Page

```ts
import { MessageBridgeManager } from 'iframe-message-bridge';

const bridge = new MessageBridgeManager();

// Register request-response event handler
bridge.on('getUserInfo', (data, sourceWindow, sourceOrigin) => {
  console.log('Received data from iframe:', data);
  return { name: 'Alice', role: 'admin' };
});

// Register broadcast message handler (optional, parent page can also receive broadcasts)
bridge.onBroadcast('system-notification', (data) => {
  console.log('Received system notification:', data);
});

// Broadcast message to all iframes
bridge.broadcast('user-login', { 
  userId: 123, 
  userName: 'Alice',
  timestamp: Date.now()
});

// Broadcast theme change
bridge.broadcast('theme-change', { theme: 'dark' });
```

---

### In iframe

```ts
import { MessageBridgeClient } from 'iframe-message-bridge';

const bridge = new MessageBridgeClient('https://your-parent-domain.com');

// Send request and wait for response
bridge.emit('getUserInfo', { id: 123 }).then(response => {
  console.log('Received response from parent page:', response);
});

// Send one-way message (no response needed)
bridge.send('logEvent', { action: 'opened-page' });

// Listen to broadcast messages from parent page
bridge.onBroadcast('user-login', (data) => {
  console.log('User login broadcast:', data);
  updateUserInfo(data);
});

bridge.onBroadcast('theme-change', (data) => {
  console.log('Theme change broadcast:', data);
  applyTheme(data.theme);
});

// Unregister specific broadcast event listener
bridge.offBroadcast('theme-change');

// Clear all broadcast listeners
bridge.clearBroadcastHandlers();
```

---

## 📌 API Reference

### `MessageBridgeManager` (Parent Page)

#### `new MessageBridgeManager()`

Initialize the bridge and register global `message` event listener.

#### `.on(eventName: string, handler: (data, sourceWindow, sourceOrigin) => any)`

Register request-response event handler. Triggered when an iframe sends a message with the specified event name. Can return data as response.

#### `.onBroadcast(eventName: string, handler: (data) => void)`

Register broadcast message handler. Triggered when receiving broadcast messages (optional feature).

#### `.broadcast(eventName: string, data: any, targetOrigin?: string)`

Send broadcast message to all iframes in the page. Automatically scans and retrieves all iframes in the current page.

- `eventName`: Event name
- `data`: Data to send
- `targetOrigin`: Target origin, defaults to `'*'`

---

### `MessageBridgeClient` (iframe Page)

#### `new MessageBridgeClient(targetOrigin: string)`

Create client instance, specifying the parent page's origin (e.g., `'https://example.com'`)

#### `.emit(eventName: string, data?: any): Promise<any>`

Send a request-type message and wait for parent page response.

#### `.send(eventName: string, data?: any): void`

Send a one-way message without waiting for response.

#### `.onBroadcast(eventName: string, handler: (data) => void)`

Register broadcast message handler to listen for broadcast messages from parent page.

#### `.offBroadcast(eventName: string)`

Unregister specific broadcast message handler.

#### `.clearBroadcastHandlers()`

Clear all broadcast message handlers.

---

## 🌟 Communication Patterns

### 1. Request-Response Pattern (iframe → Parent Page)

```ts
// In iframe
const result = await bridge.emit('getData', { id: 123 });

// In parent page
bridge.on('getData', (data) => {
  return fetchDataById(data.id);
});
```

### 2. One-way Message (iframe → Parent Page)

```ts
// In iframe
bridge.send('analytics', { event: 'page_view' });

// In parent page
bridge.on('analytics', (data) => {
  trackEvent(data.event);
  // No return value needed
});
```

### 3. Broadcast Message (Parent Page → All iframes)

```ts
// In parent page
bridge.broadcast('global-update', { version: '2.0' });

// In all iframes
bridge.onBroadcast('global-update', (data) => {
  console.log('Received global update:', data.version);
});
```

---

## 🛡️ Security Recommendations

* **Always validate `event.origin` in the parent page** to prevent malicious iframe attacks.
* **Avoid using `"*"` as `targetOrigin` in production**, specify explicit domain names.
* Recommend adding `sandbox` attribute to iframes and limiting permissions.
* For sensitive data broadcasts, consider verifying message sources in iframes.

---

## 🔄 Automatic iframe Discovery

The library automatically scans all `<iframe>` elements in the page without manual registration:

```ts
// In parent page, these iframes will automatically receive broadcast messages
// <iframe src="module1.html"></iframe>
// <iframe src="module2.html"></iframe>
// <iframe src="module3.html"></iframe>

bridge.broadcast('config-update', newConfig); // All iframes will receive this
```

Dynamically added iframes will also be automatically discovered on the next broadcast.

---

## 📜 License

[MIT](./LICENSE)

---

## ✨ Author

Developed by Henry Feng  
huili.f@gmail.com