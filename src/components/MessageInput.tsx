import { FormEvent, useRef, useState } from 'react';

interface MessageInputProps {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
}

export function MessageInput({ disabled = false, onSend }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    const message = text.trim();
    if (!message || disabled || isSending) return;

    setSendError('');
    setIsSending(true);

    try {
      await onSend(message);
      setText('');
      textareaRef.current?.focus();
    } catch (cause) {
      setSendError(cause instanceof Error ? cause.message : 'Не удалось отправить сообщение.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit();
  };

  return (
    <div>
      {sendError && <div className="send-error">{sendError}</div>}
      <form className="message-composer" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, 4000))}
          onKeyDown={async (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              await submit();
            }
          }}
          placeholder="Написать сообщение…"
          rows={1}
          disabled={disabled || isSending}
          aria-label="Текст сообщения"
        />
        <div className="composer-actions">
          <span className="character-count">{text.length}/4000</span>
          <button
            className="send-button"
            type="submit"
            disabled={disabled || isSending || !text.trim()}
            aria-label="Отправить сообщение"
            title="Отправить"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h12M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
