export type RequestMessage = {
    __bridge__: true;
    type: 'request';
    requestId: string;
    eventName: string;
    data: any;
};