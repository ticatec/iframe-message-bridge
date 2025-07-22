// 新增广播消息类型
export interface BroadcastMessage {
    __bridge__: true;
    type: 'broadcast';
    eventName: string;
    data: any;
}
