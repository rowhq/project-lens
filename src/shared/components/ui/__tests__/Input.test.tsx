import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Email address" />);
    expect(screen.getByText('Email address')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">Icon</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">Icon</span>} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('applies padding for left icon', () => {
    render(<Input leftIcon={<span>Icon</span>} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pl-10');
  });

  it('applies padding for right icon', () => {
    render(<Input rightIcon={<span>Icon</span>} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('pr-10');
  });

  it('renders different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="email" />);
    expect(screen.getByPlaceholderText('email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="password" />);
    expect(screen.getByPlaceholderText('password')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" placeholder="number" />);
    expect(screen.getByPlaceholderText('number')).toHaveAttribute('type', 'number');
  });

  it('defaults to text type', () => {
    render(<Input placeholder="text input" />);
    expect(screen.getByPlaceholderText('text input')).toHaveAttribute('type', 'text');
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="disabled" />);
    expect(screen.getByPlaceholderText('disabled')).toBeDisabled();
  });

  it('handles required attribute', () => {
    render(<Input required placeholder="required" />);
    expect(screen.getByPlaceholderText('required')).toBeRequired();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" placeholder="custom" />);
    expect(screen.getByPlaceholderText('custom')).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('associates label with input', () => {
    render(<Input label="Username" placeholder="enter username" />);
    const label = screen.getByText('Username');
    expect(label).toHaveClass('text-sm', 'font-medium', 'text-gray-700');
  });
});
