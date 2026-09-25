import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Composer } from './Composer';

function setup(props: Partial<Parameters<typeof Composer>[0]> = {}) {
  const onSend = vi.fn();
  const onStop = vi.fn();
  render(
    <Composer enabled isStreaming={false} placeholder="Ask about aibitsoft.com" onSend={onSend} onStop={onStop} {...props} />,
  );
  return { onSend, onStop, input: screen.getByRole('textbox', { name: 'Question' }) };
}

describe('Composer', () => {
  it('sends the trimmed question on Enter and clears the field', async () => {
    const { onSend, input } = setup();
    await userEvent.type(input, '  Do you build mobile apps?  {Enter}');
    expect(onSend).toHaveBeenCalledWith('Do you build mobile apps?');
    expect(input).toHaveProperty('value', '');
  });

  it('adds a newline on Shift+Enter instead of sending', async () => {
    const { onSend, input } = setup();
    await userEvent.type(input, 'First line{Shift>}{Enter}{/Shift}Second line');
    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveProperty('value', 'First line\nSecond line');
  });

  it('disables Send while the field is empty or only whitespace', async () => {
    const { onSend, input } = setup();
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toHaveProperty('disabled', true);
    await userEvent.type(input, '   {Enter}');
    expect(send).toHaveProperty('disabled', true);
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.type(input, 'Hi');
    expect(send).toHaveProperty('disabled', false);
  });

  it('shows Stop instead of Send while streaming, and Enter does not send', async () => {
    const { onSend, onStop, input } = setup({ isStreaming: true });
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    await userEvent.type(input, 'Another question{Enter}');
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('returns focus to the field when Stop is pressed, instead of dropping it', async () => {
    const onStop = vi.fn();
    const props = { enabled: true, placeholder: 'Ask', onSend: vi.fn(), onStop };
    const { rerender } = render(<Composer {...props} isStreaming />);
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    rerender(<Composer {...props} isStreaming={false} />);
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Question' }));
  });

  it('is disabled until the crawl has finished', () => {
    const { input } = setup({ enabled: false });
    expect(input).toHaveProperty('disabled', true);
    expect(screen.getByText('Questions unlock when the crawl finishes.')).toBeTruthy();
  });
});
