import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  };

  it('renders children when open', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="Modal Title" />);
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Modal {...defaultProps} title="Title" description="Modal description" />);
    expect(screen.getByText('Modal description')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(<Modal {...defaultProps} footer={<button>Save</button>} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    const backdrop = document.querySelector('.bg-black\\/50');
    fireEvent.click(backdrop!);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', () => {
    const handleClose = vi.fn();
    render(<Modal {...defaultProps} onClose={handleClose} />);

    fireEvent.click(screen.getByText('Modal content'));

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders close button in header', () => {
    render(<Modal {...defaultProps} title="Title" />);
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('applies size classes correctly', () => {
    const { rerender, container } = render(<Modal {...defaultProps} size="sm" />);
    expect(container.querySelector('.max-w-sm')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} size="md" />);
    expect(container.querySelector('.max-w-md')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} size="lg" />);
    expect(container.querySelector('.max-w-lg')).toBeInTheDocument();

    rerender(<Modal {...defaultProps} size="xl" />);
    expect(container.querySelector('.max-w-xl')).toBeInTheDocument();
  });

  it('defaults to md size', () => {
    const { container } = render(<Modal {...defaultProps} />);
    expect(container.querySelector('.max-w-md')).toBeInTheDocument();
  });

  it('title is rendered as h2', () => {
    render(<Modal {...defaultProps} title="Heading" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Heading');
  });

  it('has fixed positioning with z-50', () => {
    const { container } = render(<Modal {...defaultProps} />);
    expect(container.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
  });
});
