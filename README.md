# iframe-message-bridge

A lightweight TypeScript library to enable structured and reliable messaging between a parent window and multiple iframes using the `postMessage` API. Supports both fire-and-forget and request-response patterns with automatic message tracking and origin verification.

---

## 📦 Features

- ✅ **One-way or two-way communication** between parent and iframe
- 🔁 **Request-response messaging** using `Promise`
- 🧩 **Multiple iframe support**: parent can distinguish messages by iframe window
- 🔐 **Origin-safe**: only responds to trusted origins
- 🧼 Lightweight and dependency-free

---

## 🚀 Installation

```bash
npm install @ticatec/iframe-message-bridge
````

---

## 🧠 How It Works

* `MessageBridgeManager` — used in the **parent window**, handles incoming messages from iframes.
* `MessageBridgeClient` — used in the **iframe**, sends messages and optionally waits for responses from the parent.

---

## 🔧 Usage

### In the Parent Window

```ts
import { MessageBridgeManager } from 'iframe-message-bridge';

const bridge = new MessageBridgeManager();

// Register handler for an event
bridge.on('getUserInfo', (data, sourceWindow, sourceOrigin) => {
  console.log('Received from iframe:', data);
  return { name: 'Alice', role: 'admin' };
});
```

### In the Iframe

```ts
import { MessageBridgeClient } from 'iframe-message-bridge';

const bridge = new MessageBridgeClient('https://your-parent-domain.com');

// Send a request and wait for response
bridge.emit('getUserInfo', { id: 123 }).then(response => {
  console.log('Received from parent:', response);
});

// Or send a one-way message
bridge.send('logEvent', { action: 'opened-page' });
```

---

## 📌 API Reference

### `MessageBridgeManager`

#### `new MessageBridgeManager()`

Sets up message listener in the parent window.

#### `.on(eventName: string, handler: (data, sourceWindow, sourceOrigin) => any)`

Registers a handler that will be called when an iframe emits an event.

---

### `MessageBridgeClient`

#### `new MessageBridgeClient(targetOrigin: string)`

Creates a client instance in the iframe targeting the given parent origin.

#### `.emit(eventName: string, data?: any): Promise<any>`

Sends a request to the parent and returns a Promise that resolves with the response.

#### `.send(eventName: string, data?: any): void`

Sends a one-way message to the parent window (no response expected).

---

## 🛡️ Security Considerations

* Always validate `event.origin` on the parent side.
* Do **not** use `"*"` as the `targetOrigin` unless you're in a trusted environment.
* If possible, set `sandbox` on the iframe with appropriate restrictions.

---

## 📜 License

[MIT](./LICENSE)

---

## ✨ Author

Henry Feng

huili.f@gmail.com