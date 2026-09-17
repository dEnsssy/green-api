import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  phoneNumber: string;
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function MessageList({ messages, phoneNumber }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list empty" ref={listRef}>
        <div className="empty-state">
          <div className="empty-avatar">{phoneNumber.slice(-2)}</div>
          <h3>Начните переписку</h3>
          <p>Отправьте первое сообщение. Ответ собеседника появится здесь автоматически.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list" ref={listRef}>
      <div className="message-day">Сегодня</div>

      {messages.map((message) => (
        <div
          className={`message-row ${message.direction === 'outgoing' ? 'outgoing' : 'incoming'}`}
          key={message.id}
        >
          <div className="message-bubble">
            <div className="message-text">{message.text}</div>
            <div className="message-meta">
              <span>{formatTime(message.timestamp)}</span>
              {message.direction === 'outgoing' && (
                <span className={`message-status ${message.status ?? 'sent'}`}>
                  {message.status === 'error' ? '!' : message.status === 'sending' ? '◷' : '✓✓'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
