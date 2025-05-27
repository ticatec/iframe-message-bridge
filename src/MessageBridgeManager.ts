import {RequestMessage} from "./RequestMessage";
import {ResponseMessage} from "./ResponseMessage";

type EventHandler = (data: any, sourceWindow: Window, sourceOrigin: string) => any;

export class MessageBridgeManager {
    private handlers = new Map<string, EventHandler>();

    constructor() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    private async handleMessage(event: MessageEvent) {
        const { data, source, origin } = event;

        if (!data || data.__bridge__ !== true || data.type !== 'request') return;

        const { requestId, eventName, data: requestData } = data as RequestMessage;
        const handler = this.handlers.get(eventName);
        if (!handler) return;

        try {
            const result = await handler(requestData, source as Window, origin);
            const response: ResponseMessage = {
                __bridge__: true,
                type: 'response',
                requestId,
                result,
            };
            // @ts-ignore
            source?.postMessage(response, origin);
        } catch (err: any) {
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

    public on(eventName: string, handler: EventHandler) {
        this.handlers.set(eventName, handler);
    }
}
