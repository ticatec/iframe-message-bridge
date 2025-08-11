import {RequestMessage} from "./RequestMessage";
import {ResponseMessage} from "./ResponseMessage";
import {BroadcastMessage} from "./BroadcastMessage";

type EventHandler = (data: any, sourceWindow: Window, sourceOrigin: string) => any;
type BroadcastHandler = (data: any) => void;

export class MessageBridgeManager {
    private handlers = new Map<string, EventHandler>();
    private broadcastHandlers = new Map<string, BroadcastHandler>();
    private readonly boundHandleMessage: (event: MessageEvent) => void;

    constructor() {
        this.boundHandleMessage = this.handleMessage.bind(this);
        window.addEventListener('message', this.boundHandleMessage);
    }

    private async handleMessage(event: MessageEvent) {
        const { data, source, origin } = event;

        if (!data || data.__bridge__ !== true) return;

        // 处理请求-响应消息
        if (data.type === 'request') {
            const { requestId, eventName, data: requestData } = data as RequestMessage;
            const handler = this.handlers.get(eventName);
            if (!handler) return;

            try {
                const result = await handler(requestData, source as Window, origin);

                // 只有当 requestId 不为 null 时才发送响应
                if (requestId !== null) {
                    const response: ResponseMessage = {
                        __bridge__: true,
                        type: 'response',
                        requestId,
                        result,
                    };
                    // @ts-ignore
                    source?.postMessage(response, origin);
                }
            } catch (err: any) {
                // 只有当 requestId 不为 null 时才发送错误响应
                if (requestId !== null) {
                    const response: ResponseMessage = {
                        __bridge__: true,
                        type: 'response',
                        requestId,
                        error: err.message || String(err),
                    };
                    // @ts-ignore
                    source?.postMessage(response, origin);
                }
            }
        }

        // 处理广播消息
        if (data.type === 'broadcast') {
            const { eventName, data: broadcastData } = data as BroadcastMessage;
            const handler = this.broadcastHandlers.get(eventName);
            if (handler) {
                handler(broadcastData);
            }
        }
    }

    // 原有的请求-响应处理器注册
    public on(eventName: string, handler: EventHandler) {
        this.handlers.set(eventName, handler);
    }

    // 注册广播消息处理器
    public onBroadcast(eventName: string, handler: BroadcastHandler) {
        this.broadcastHandlers.set(eventName, handler);
    }

    // 注销请求-响应处理器
    public off(eventName: string) {
        this.handlers.delete(eventName);
    }

    // 注销广播消息处理器
    public offBroadcast(eventName: string) {
        this.broadcastHandlers.delete(eventName);
    }

    // 清空所有请求-响应处理器
    public clearHandlers() {
        this.handlers.clear();
    }

    // 清空所有广播消息处理器
    public clearBroadcastHandlers() {
        this.broadcastHandlers.clear();
    }

    // 销毁实例，移除全局监听器
    public destroy() {
        window.removeEventListener('message', this.boundHandleMessage);
        this.handlers.clear();
        this.broadcastHandlers.clear();
    }

    // 自动获取所有iframe窗口
    private getAllIframes(): Window[] {
        const iframes = document.querySelectorAll('iframe');
        const iframeWindows: Window[] = [];

        iframes.forEach(iframe => {
            try {
                if (iframe.contentWindow) {
                    iframeWindows.push(iframe.contentWindow);
                }
            } catch (error) {
                // 跨域iframe可能无法访问contentWindow，但仍可以发送消息
                console.warn('Cannot access iframe contentWindow (may be cross-origin):', error);
            }
        });

        return iframeWindows;
    }

    // 向所有iframe广播消息
    public broadcast(eventName: string, data: any, targetOrigin: string = '*') {
        const message: BroadcastMessage = {
            __bridge__: true,
            type: 'broadcast',
            eventName,
            data,
        };

        const iframeWindows = this.getAllIframes();

        iframeWindows.forEach(iframeWindow => {
            try {
                iframeWindow.postMessage(message, targetOrigin);
            } catch (error) {
                console.warn('Failed to send broadcast message to iframe:', error);
            }
        });
    }
}