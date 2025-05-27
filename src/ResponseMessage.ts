export type ResponseMessage = {
    __bridge__: true;
    type: 'response';
    requestId: string;
    result?: any;
    error?: string;
};
