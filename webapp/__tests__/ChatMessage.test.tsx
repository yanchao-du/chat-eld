import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessage from '@/components/ChatMessage';

describe('ChatMessage', () => {
  it('renders user message content', () => {
    render(<ChatMessage role="user" content="Where do I vote?" />);
    expect(screen.getByText('Where do I vote?')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<ChatMessage role="assistant" content="You can find your polling station on the ELD portal." />);
    expect(screen.getByText('You can find your polling station on the ELD portal.')).toBeInTheDocument();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(<ChatMessage role="user" content="Hello" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-end');
  });

  it('aligns assistant messages to the left', () => {
    const { container } = render(<ChatMessage role="assistant" content="Hello" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('justify-start');
  });
});
