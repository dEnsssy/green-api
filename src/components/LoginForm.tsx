import { FormEvent, useState } from 'react';
import { getStateInstance } from '../services/greenApi';
import type { Credentials } from '../types/chat';
import { Logo } from './Logo';

interface LoginFormProps {
  onSuccess: (credentials: Credentials) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполни оба поля.');
      return;
    }

    const credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };

    setIsSubmitting(true);

    try {
      const state = await getStateInstance(credentials);

      if (state.stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован. Текущее состояние: ${state.stateInstance}.`);
        return;
      }

      onSuccess(credentials);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось подключиться к GREEN-API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Logo />
        <div className="auth-copy">
          <h1>Войти в чат</h1>
          <p>Используй данные своего инстанса GREEN-API для подключения к MAX.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>ID Instance</span>
            <input
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
              placeholder="3100000000"
              inputMode="numeric"
              autoComplete="off"
              disabled={isSubmitting}
            />
          </label>

          <label>
            <span>API Token Instance</span>
            <input
              type="password"
              value={apiTokenInstance}
              onChange={(event) => setApiTokenInstance(event.target.value)}
              placeholder="••••••••••••••••••••"
              autoComplete="off"
              disabled={isSubmitting}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Подключение…' : 'Войти'}
          </button>
        </form>

        <p className="auth-note">
          Данные используются только в текущей сессии браузера и не сохраняются в приложении.
        </p>
      </section>
    </main>
  );
}
