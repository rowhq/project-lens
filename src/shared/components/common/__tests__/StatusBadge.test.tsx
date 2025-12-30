import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, LiveStatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders status text correctly', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('maps status values to display labels', () => {
    const { rerender } = render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();

    rerender(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('applies correct color classes for success statuses', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('applies correct color classes for warning statuses', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toHaveClass('bg-yellow-100', 'text-yellow-700');
  });

  it('applies correct color classes for error statuses', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('applies correct color classes for running statuses', () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByText('Processing')).toHaveClass('bg-blue-100', 'text-blue-700');
  });

  it('renders all job statuses correctly', () => {
    const { rerender } = render(<StatusBadge status="pending_dispatch" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();

    rerender(<StatusBadge status="dispatched" />);
    expect(screen.getByText('Dispatched')).toBeInTheDocument();

    rerender(<StatusBadge status="accepted" />);
    expect(screen.getByText('Accepted')).toBeInTheDocument();

    rerender(<StatusBadge status="submitted" />);
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<StatusBadge status="active" size="sm" />);
    expect(screen.getByText('Active')).toHaveClass('px-2', 'py-0.5');

    rerender(<StatusBadge status="active" size="md" />);
    expect(screen.getByText('Active')).toHaveClass('px-2.5', 'py-1');
  });
});

describe('LiveStatusBadge', () => {
  it('shows pulse animation for running statuses', () => {
    const { container } = render(<LiveStatusBadge status="running" pulse />);
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('shows pulse animation for in_progress statuses', () => {
    const { container } = render(<LiveStatusBadge status="in_progress" pulse />);
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('does not show pulse for completed statuses', () => {
    const { container } = render(<LiveStatusBadge status="completed" pulse />);
    expect(container.querySelector('.animate-ping')).not.toBeInTheDocument();
  });

  it('does not show pulse when pulse prop is false', () => {
    const { container } = render(<LiveStatusBadge status="running" pulse={false} />);
    expect(container.querySelector('.animate-ping')).not.toBeInTheDocument();
  });
});
