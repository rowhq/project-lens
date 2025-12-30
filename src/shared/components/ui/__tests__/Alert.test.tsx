import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../Alert';

describe('Alert', () => {
  it('renders children correctly', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Alert Title">Message body</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Message body')).toBeInTheDocument();
  });

  it('applies info variant classes by default', () => {
    render(<Alert>Info message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
  });

  it('applies success variant classes', () => {
    render(<Alert variant="success">Success!</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
  });

  it('applies warning variant classes', () => {
    render(<Alert variant="warning">Warning!</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
  });

  it('applies error variant classes', () => {
    render(<Alert variant="error">Error!</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
  });

  it('shows dismiss button when dismissible is true', () => {
    render(<Alert dismissible>Dismissible alert</Alert>);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('does not show dismiss button by default', () => {
    render(<Alert>Non-dismissible alert</Alert>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = vi.fn();
    render(<Alert dismissible onDismiss={handleDismiss}>Alert</Alert>);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Alert className="custom-alert">Message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-alert');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Alert ref={ref}>Message</Alert>);
    expect(ref).toHaveBeenCalled();
  });

  it('renders with title having correct styling', () => {
    render(<Alert title="Important">Details here</Alert>);
    const title = screen.getByText('Important');
    expect(title).toHaveClass('font-medium', 'mb-1');
  });

  it('renders children in text-sm container', () => {
    const { container } = render(<Alert>Small text content</Alert>);
    expect(container.querySelector('.text-sm')).toContainHTML('Small text content');
  });
});
