import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceDisplay, PriceRange, PriceWithChange, PriceBadge } from '../PriceDisplay';

describe('PriceDisplay', () => {
  it('formats price with dollar sign and commas', () => {
    render(<PriceDisplay value={1234567} />);
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<PriceDisplay value={1000} size="sm" />);
    expect(screen.getByText('$1,000')).toHaveClass('text-sm');

    rerender(<PriceDisplay value={1000} size="lg" />);
    expect(screen.getByText('$1,000')).toHaveClass('text-2xl');

    rerender(<PriceDisplay value={1000} size="xl" />);
    expect(screen.getByText('$1,000')).toHaveClass('text-4xl');
  });

  it('handles zero values', () => {
    render(<PriceDisplay value={0} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('rounds values to whole numbers by default', () => {
    render(<PriceDisplay value={1234.56} />);
    expect(screen.getByText('$1,235')).toBeInTheDocument();
  });
});

describe('PriceRange', () => {
  it('renders midpoint and range', () => {
    render(<PriceRange low={100000} high={150000} />);
    expect(screen.getByText('$125,000')).toBeInTheDocument();
    expect(screen.getByText('$100,000 - $150,000')).toBeInTheDocument();
  });

  it('uses custom midpoint when provided', () => {
    render(<PriceRange low={100000} high={150000} midpoint={130000} />);
    expect(screen.getByText('$130,000')).toBeInTheDocument();
  });
});

describe('PriceWithChange', () => {
  it('shows positive change with trend up icon', () => {
    const { container } = render(<PriceWithChange value={500000} changePercent={5.2} />);
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
    expect(screen.getByText('+5.2%').parentElement).toHaveClass('text-green-600');
  });

  it('shows negative change with trend down icon', () => {
    const { container } = render(<PriceWithChange value={500000} changePercent={-3.1} />);
    expect(screen.getByText('-3.1%')).toBeInTheDocument();
    expect(screen.getByText('-3.1%').parentElement).toHaveClass('text-red-600');
  });

  it('shows zero change in neutral color', () => {
    render(<PriceWithChange value={500000} changePercent={0} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('0.0%').parentElement).toHaveClass('text-neutral-500');
  });

  it('calculates change from previous value', () => {
    render(<PriceWithChange value={550000} previousValue={500000} />);
    expect(screen.getByText('+10.0%')).toBeInTheDocument();
  });
});

describe('PriceBadge', () => {
  it('renders price in badge format', () => {
    render(<PriceBadge value={99} />);
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('applies variant colors', () => {
    const { rerender, container } = render(<PriceBadge value={99} variant="success" />);
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();

    rerender(<PriceBadge value={99} variant="warning" />);
    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<PriceBadge value={99} label="Fee" />);
    expect(screen.getByText('Fee')).toBeInTheDocument();
    expect(screen.getByText('$99')).toBeInTheDocument();
  });
});
