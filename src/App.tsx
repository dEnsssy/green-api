import { useCallback, useState } from 'react';
import { ChatView } from './components/ChatView';
import { LoginForm } from './components/LoginForm';
import { Logo } from './components/Logo';
import { NewChatForm } from './components/NewChatForm';
import { useMessageReceiver } from './hooks/useMessageReceiver';
import type { Chat, ChatMessage, Credentials } from './types/chat';
import { formatPhone } from './utils/phone';

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [receiverError, setReceiverError] = useState('');

  const handleMessageAdded = useCallback((message: ChatMessage) => {
    setMessages((current) => {
      const existingIndex = current.findIndex((item) => item.id === message.id);

      if (existingIndex === -1) {
        return [...current, message];
      }

      const next = [...current];
      next[existingIndex] = message;
      return next;
    });
  }, []);

  const handleIncomingMessage = useCallback((message: ChatMessage) => {
    setReceiverError('');
    handleMessageAdded(message);
  }, [handleMessageAdded]);

  const handleReceiverError = useCallback((message: string) => {
    setReceiverError(message);
  }, []);

  useMessageReceiver({
    credentials,
    activeChatId: chat?.chatId ?? null,
    onMessage: handleIncomingMessage,
    onError: handleReceiverError,
  });

  const handleLogin = (nextCredentials: Credentials) => {
    setCredentials(nextCredentials);
    setChat(null);
    setMessages([]);
    setReceiverError('');
  };

  const handleChatCreated = (nextChat: Chat) => {
    setChat(nextChat);
    setMessages([]);
    setReceiverError('');
  };

  const handleLogout = () => {
    setCredentials(null);
    setChat(null);
    setMessages([]);
    setReceiverError('');
  };

  if (!credentials) {
    return <LoginForm onSuccess={handleLogin} />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="sidebar-header">
          <Logo />
          <span className="connected-badge">
            <i /> подключено
          </span>
        </header>

        <NewChatForm credentials={credentials} onChatCreated={handleChatCreated} />

        <div className="chat-list-section">
          <span className="eyebrow">Чаты</span>

          {chat ? (
            <button className="chat-preview active" type="button">
              <div className="avatar small">{chat.phoneNumber.slice(-2)}</div>
              <div className="chat-preview-copy">
                <strong>{formatPhone(chat.phoneNumber)}</strong>
                <span>{messages.at(-1)?.text ?? 'Новая переписка'}</span>
              </div>
            </button>
          ) : (
            <div className="chat-empty">
              <div className="chat-empty-icon">+</div>
              <p>Создайте чат по номеру телефона</p>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <span>GREEN-API · MAX</span>
          <small>{credentials.idInstance}</small>
        </div>
      </aside>

      <section className="content-area">
        {chat ? (
          <ChatView
            credentials={credentials}
            chat={chat}
            messages={messages}
            onMessageAdded={handleMessageAdded}
            onLogout={handleLogout}
            receiverError={receiverError}
          />
        ) : (
          <div className="welcome-screen">
            <div className="welcome-mark">M</div>
            <h1>Ваш чат MAX</h1>
            <p>Создайте переписку слева, чтобы начать отправлять сообщения.</p>
            <div className="welcome-tip">
              <span>i</span>
              <span>Входящие текстовые сообщения появляются автоматически через HTTP API.</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
