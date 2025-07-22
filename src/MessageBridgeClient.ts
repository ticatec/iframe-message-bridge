import { RequestMessage } from "./RequestMessage";
import { ResponseMessage } from "./ResponseMessage";
import { BroadcastMessage } from "./BroadcastMessage";

type BroadcastHandler = (data: any) => void;

export class MessageBridgeClient {
    private targetOrigin: string;
    private pending = new Map<string, { resolve: Function; reject: Function }>();
    private broadcastHandlers = new Map<string, BroadcastHandler>();
    private requestId = 0;

    constructor(targetOrigin: string) {
        this.targetOrigin = targetOrigin;
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    private handleMessage(event: MessageEvent) {
        if (event.origin !== this.targetOrigin) return;
        const { data } = event;
        if (!data || data.__bridge__ !== true) return;

        // 处理响应消息
        if (data.type === 'response') {
            const message = data as ResponseMessage;
            const { requestId, result, error } = message;
            const pending = this.pending.get(requestId);
            if (pending) {
                if (error) pending.reject(new Error(error));
                else pending.resolve(result);
                this.pending.delete(requestId);
            }
        }

        // 处理广播消息
        if (data.type === 'broadcast') {
            const message = data as BroadcastMessage;
            const { eventName, data: broadcastData } = message;
            const handler = this.broadcastHandlers.get(eventName);
            if (handler) {
                handler(broadcastData);
            }
        }
    }

    // 发送请求并等待响应
    public emit(eventName: string, data?: any): Promise<any> {
        const requestId = `req_${Date.now()}_${++this.requestId}`;
        const message: RequestMessage = {
            __bridge__: true,
            type: 'request',
            requestId,
            eventName,
            data,
        };
        window.parent.postMessage(message, this.targetOrigin);
        return new Promise((resolve, reject) => {
            this.pending.set(requestId, { resolve, reject });
        });
    }

    // 发送单向消息（不等待响应）
    public send(eventName: string, data?: any) {
        // 使用 null 作为 requestId 表示不需要响应
        const message: Omit<RequestMessage, 'requestId'> & { requestId: null } = {
            __bridge__: true,
            type: 'request',
            requestId: null,
            eventName,
            data,
        };
        window.parent.postMessage(message, this.targetOrigin);
    }

    // 注册广播消息处理器
    public onBroadcast(eventName: string, handler: BroadcastHandler) {
        this.broadcastHandlers.set(eventName, handler);
    }

    // 取消注册广播消息处理器
    public offBroadcast(eventName: string) {
        this.broadcastHandlers.delete(eventName);
    }

    // 清空所有广播消息处理器
    public clearBroadcastHandlers() {
        this.broadcastHandlers.clear();
    }
}