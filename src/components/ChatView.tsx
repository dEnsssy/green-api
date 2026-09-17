import { useCallback, useMemo, useState } from 'react';
import { sendMessage } from '../services/greenApi';
import type { Chat, ChatMessage, Credentials } from '../types/chat';
import { formatPhone } from '../utils/phone';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ChatViewProps {
  credentials: Credentials;
  chat: Chat;
  messages: ChatMessage[];
  onMessageAdded: (message: ChatMessage) => void;
  onLogout: () => void;
  receiverError: string;
}

export function ChatView({
  credentials,
  chat,
  messages,
  onMessageAdded,
  onLogout,
  receiverError,
}: ChatViewProps) {
  const [isOnline] = useState(true);

  const visibleMessages = useMemo(
    () => messages.filter((message) => Boolean(message.text)),
    [messages],
  );

  const handleSend = useCallback(
    async (text: string) => {
      const optimisticId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        text,
        direction: 'outgoing',
        timestamp: Date.now(),
        status: 'sending',
      };

      onMessageAdded(optimisticMessage);

      try {
        await sendMessage(credentials, chat.chatId, text);
        onMessageAdded({
          ...optimisticMessage,
          status: 'sent',
        });
      } catch (cause) {
        onMessageAdded({
          ...optimisticMessage,
          status: 'error',
        });
        throw cause instanceof Error ? cause : new Error('Не удалось отправить сообщение.');
      }
    },
    [chat.chatId, credentials, onMessageAdded],
  );

  return (
    <section className="chat-window">
      <header className="chat-header">
        <div className="chat-person">
          <div className="avatar">
            {chat.phoneNumber.slice(-2)}
          </div>
          <div>
            <strong>{chat.name ?? formatPhone(chat.phoneNumber)}</strong>
            <span>
              <i className={isOnline ? 'online-dot' : 'offline-dot'} />
              Подключено к MAX
            </span>
          </div>
        </div>

        <button className="icon-button" type="button" onClick={onLogout} title="Выйти">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 8l4 4-4 4M9 12h9" />
          </svg>
        </button>
      </header>

      {receiverError && (
        <div className="receiver-warning" role="status">
          Получение сообщений временно недоступно: {receiverError}
        </div>
      )}

      <MessageList messages={visibleMessages} phoneNumber={chat.phoneNumber} />

      <footer className="chat-footer">
        <MessageInput onSend={handleSend} />
        <p className="footer-hint">Enter — отправить · Shift + Enter — новая строка</p>
      </footer>
    </section>
  );
}
