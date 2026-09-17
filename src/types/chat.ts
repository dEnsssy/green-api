export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface Chat {
  phoneNumber: string;
  chatId: string;
  name?: string;
}

export type MessageDirection = 'incoming' | 'outgoing';

export interface ChatMessage {
  id: string;
  text: string;
  direction: MessageDirection;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId?: string;
  fromCache?: boolean;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface NotificationResponse {
  receiptId: number;
  body: IncomingMessageWebhook;
}

export interface IncomingMessageWebhook {
  typeWebhook?: string;
  timestamp?: number;
  idMessage?: string;
  senderData?: {
    chatId?: string;
    chatName?: string;
    senderName?: string;
    senderPhoneNumber?: number;
  };
  messageData?: {
    typeMessage?: string;
    textMessageData?: {
      textMessage?: string;
    };
  };
}

export interface StateInstanceResponse {
  stateInstance: string;
}
