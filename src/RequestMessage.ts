export type RequestMessage = {
    __bridge__: true;
    type: 'request';
    requestId: string | null; // 允许为 null，表示不需要响应的单向消息
    eventName: string;
    data: any;
};