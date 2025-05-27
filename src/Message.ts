export type Message = {
    id: string;
    type: 'request' | 'response';
    event: string;
    data?: any;
    error?: string;
};