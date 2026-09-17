import { FormEvent, useState } from 'react';
import { checkAccount } from '../services/greenApi';
import type { Chat, Credentials } from '../types/chat';
import { normalizePhone } from '../utils/phone';

interface NewChatFormProps {
  credentials: Credentials;
  onChatCreated: (chat: Chat) => void;
}

export function NewChatForm({ credentials, onChatCreated }: NewChatFormProps) {
  const [phone, setPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedPhone = normalizePhone(phone);

    if (![11, 12].includes(normalizedPhone.length)) {
      setError('Введите номер в международном формате: 11–12 цифр.');
      return;
    }

    if (!(normalizedPhone.startsWith('7') || normalizedPhone.startsWith('375'))) {
      setError('Для MAX через GREEN-API поддерживаются номера РФ (+7) и РБ (+375).');
      return;
    }

    setIsCreating(true);

    try {
      const response = await checkAccount(credentials, normalizedPhone);

      if (!response.exist || !response.chatId) {
        setError('Для этого номера не найден аккаунт MAX.');
        return;
      }

      onChatCreated({
        phoneNumber: normalizedPhone,
        chatId: response.chatId,
      });
      setPhone('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось создать чат.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="new-chat-panel">
      <div className="panel-title-row">
        <div>
          <span className="eyebrow">Новая переписка</span>
          <h2>Кому написать?</h2>
        </div>
        <span className="panel-icon">+</span>
      </div>

      <form className="new-chat-form" onSubmit={handleSubmit}>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Телефон, например 79991234567"
          inputMode="tel"
          autoComplete="tel"
          disabled={isCreating}
        />
        <button className="primary-button compact" type="submit" disabled={isCreating}>
          {isCreating ? 'Проверка…' : 'Открыть чат'}
        </button>
      </form>

      {error && <div className="form-error inline">{error}</div>}
    </section>
  );
}
