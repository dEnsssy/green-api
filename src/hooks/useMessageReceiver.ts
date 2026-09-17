import { useEffect, useRef } from 'react';
import { deleteNotification, receiveNotification } from '../services/greenApi';
import type { ChatMessage, Credentials } from '../types/chat';

interface UseMessageReceiverOptions {
  credentials: Credentials | null;
  activeChatId: string | null;
  onMessage: (message: ChatMessage) => void;
  onError: (message: string) => void;
}

export function useMessageReceiver({
  credentials,
  activeChatId,
  onMessage,
  onError,
}: UseMessageReceiverOptions): void {
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
  }, [onMessage, onError]);

  useEffect(() => {
    if (!credentials || !activeChatId) {
      return;
    }

    const controller = new AbortController();
    const processedIds = new Set<string>();

    const receiveLoop = async (): Promise<void> => {
      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(
            credentials,
            controller.signal,
            30,
          );

          if (!notification) {
            continue;
          }

          const { receiptId, body } = notification;

          try {
            const isIncomingText =
              body.typeWebhook === 'incomingMessageReceived' &&
              body.messageData?.typeMessage === 'textMessage';
            const chatId = body.senderData?.chatId;
            const text = body.messageData?.textMessageData?.textMessage;
            const messageId = body.idMessage;

            if (
              isIncomingText &&
              chatId === activeChatId &&
              text &&
              messageId &&
              !processedIds.has(messageId)
            ) {
              processedIds.add(messageId);

              onMessageRef.current({
                id: messageId,
                text,
                direction: 'incoming',
                timestamp: (body.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
                status: 'sent',
              });
            }
          } finally {
            await deleteNotification(credentials, receiptId);
          }
        } catch (error) {
          if (controller.signal.aborted) {
            break;
          }

          onErrorRef.current(
            error instanceof Error ? error.message : 'Не удалось получить сообщение',
          );

          // Не создаём быстрый бесконечный retry при временной ошибке API.
          await new Promise<void>((resolve) => window.setTimeout(resolve, 1500));
        }
      }
    };

    void receiveLoop();

    return () => controller.abort();
  }, [credentials, activeChatId]);
}
