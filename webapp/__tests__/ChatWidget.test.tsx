import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from '@/components/ChatWidget';

global.fetch = jest.fn();

function mockFetchSuccess(reply: string) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ reply }),
  });
}

function mockFetchError() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
}

describe('ChatWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the open-chat button initially', () => {
    render(<ChatWidget />);
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });

  it('does not show the chat panel before the button is clicked', () => {
    render(<ChatWidget />);
    expect(screen.queryByText('ELD Info Assistant')).not.toBeInTheDocument();
  });

  it('opens the chat panel when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    expect(screen.getByText('ELD Info Assistant')).toBeInTheDocument();
  });

  it('shows the empty-state greeting when no messages exist', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    expect(screen.getByText(/ELDBot/i)).toBeInTheDocument();
  });

  it('closes the panel when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    await user.click(screen.getByRole('button', { name: /close chat/i }));
    expect(screen.queryByText('ELD Info Assistant')).not.toBeInTheDocument();
  });

  it('disables Send when the input is empty', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('enables Send when the user types a message', async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    await user.type(screen.getByPlaceholderText(/ask about elections/i), 'Hello');
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
  });

  it('sends a message and displays the bot reply', async () => {
    mockFetchSuccess('Polling hours are 8am to 8pm.');
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    await user.type(screen.getByPlaceholderText(/ask about elections/i), 'What time do polls close?');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText('Polling hours are 8am to 8pm.')).toBeInTheDocument();
    });
  });

  it('clears the input after sending', async () => {
    mockFetchSuccess('Answer');
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    const input = screen.getByPlaceholderText(/ask about elections/i);
    await user.type(input, 'Hello');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('shows a fallback message when the API call fails', async () => {
    mockFetchError();
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    await user.type(screen.getByPlaceholderText(/ask about elections/i), 'Hello');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/1800-225-5353/)).toBeInTheDocument();
    });
  });

  it('posts to /api/chat with message and history', async () => {
    mockFetchSuccess('Answer');
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByLabelText('Open chat'));
    await user.type(screen.getByPlaceholderText(/ask about elections/i), 'Where do I vote?');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Where do I vote?'),
        })
      );
    });
  });
});
