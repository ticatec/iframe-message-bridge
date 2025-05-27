type Message = {
    __bridge__: true;
    type: 'request' | 'response';
    requestId: string | null;
    eventName?: string;
    data?: any;
    result?: any;
    error?: string;
};

export class MessageBridgeClient {
    private targetOrigin: string;
    private pending = new Map<string, { resolve: Function; reject: Function }>();
    private requestId = 0;

    constructor(targetOrigin: string) {
        this.targetOrigin = targetOrigin;
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    private handleMessage(event: MessageEvent) {
        if (event.origin !== this.targetOrigin) return;
        const message = event.data as Message;
        if (!message || message.__bridge__ !== true || message.type !== 'response') return;

        const { requestId, result, error } = message;
        const pending = this.pending.get(requestId!);
        if (pending) {
            if (error) pending.reject(new Error(error));
            else pending.resolve(result);
            this.pending.delete(requestId!);
        }
    }

    public emit(eventName: string, data?: any): Promise<any> {
        const requestId = `req_${Date.now()}_${++this.requestId}`;
        const message: Message = {
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

    public send(eventName: string, data?: any) {
        const message: Message = {
            __bridge__: true,
            type: 'request',
            requestId: null,
            eventName,
            data,
        };
        window.parent.postMessage(message, this.targetOrigin);
    }
}
