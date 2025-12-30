import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCard, PropertyCardCompact } from '../PropertyCard';

const mockAddress = {
  street: '123 Main St',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
};

describe('PropertyCard', () => {
  it('renders address correctly', () => {
    render(<PropertyCard id="prop-1" address={mockAddress} />);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Austin, TX 78701')).toBeInTheDocument();
  });

  it('renders image when imageUrl is provided', () => {
    render(<PropertyCard id="prop-1" address={mockAddress} imageUrl="https://example.com/image.jpg" />);
    const img = screen.getByAltText('123 Main St, Austin, TX 78701');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders placeholder when no image is provided', () => {
    const { container } = render(<PropertyCard id="prop-1" address={mockAddress} />);
    expect(container.querySelector('.bg-neutral-100')).toBeInTheDocument();
  });

  it('renders status badge when status is provided', () => {
    render(<PropertyCard id="prop-1" address={mockAddress} status="running" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('renders property details when provided', () => {
    render(
      <PropertyCard
        id="prop-1"
        address={mockAddress}
        bedrooms={3}
        bathrooms={2}
        sqft={1500}
      />
    );
    expect(screen.getByText('3 bed')).toBeInTheDocument();
    expect(screen.getByText('2 bath')).toBeInTheDocument();
    expect(screen.getByText('1,500 sqft')).toBeInTheDocument();
  });

  it('renders estimated value when provided', () => {
    render(<PropertyCard id="prop-1" address={mockAddress} estimatedValue={450000} />);
    expect(screen.getByText('$450,000')).toBeInTheDocument();
  });

  it('renders confidence meter when score is provided', () => {
    render(
      <PropertyCard
        id="prop-1"
        address={mockAddress}
        estimatedValue={450000}
        confidenceScore={85}
      />
    );
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<PropertyCard id="prop-1" address={mockAddress} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies hover styles when onClick is provided', () => {
    render(<PropertyCard id="prop-1" address={mockAddress} onClick={() => {}} />);
    const card = screen.getByRole('button');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PropertyCard id="prop-1" address={mockAddress} className="custom-card" />
    );
    expect(container.firstChild).toHaveClass('custom-card');
  });

  it('does not render property details section when no details provided', () => {
    const { container } = render(<PropertyCard id="prop-1" address={mockAddress} />);
    expect(container.querySelector('.gap-4.text-sm.text-neutral-600')).not.toBeInTheDocument();
  });
});

describe('PropertyCardCompact', () => {
  it('renders address correctly', () => {
    render(<PropertyCardCompact address={mockAddress} />);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Austin, TX')).toBeInTheDocument();
  });

  it('renders image when imageUrl is provided', () => {
    render(<PropertyCardCompact address={mockAddress} imageUrl="https://example.com/image.jpg" />);
    const img = screen.getByAltText('123 Main St');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders estimated value when provided', () => {
    render(<PropertyCardCompact address={mockAddress} estimatedValue={350000} />);
    expect(screen.getByText('$350,000')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<PropertyCardCompact address={mockAddress} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected styles when selected is true', () => {
    const { container } = render(
      <PropertyCardCompact address={mockAddress} onClick={() => {}} selected />
    );
    expect(container.firstChild).toHaveClass('border-brand-500', 'ring-2', 'ring-brand-100');
  });

  it('does not apply selected styles when selected is false', () => {
    const { container } = render(
      <PropertyCardCompact address={mockAddress} onClick={() => {}} selected={false} />
    );
    expect(container.firstChild).toHaveClass('border-neutral-200');
    expect(container.firstChild).not.toHaveClass('border-brand-500');
  });

  it('applies custom className', () => {
    const { container } = render(
      <PropertyCardCompact address={mockAddress} className="custom-compact" />
    );
    expect(container.firstChild).toHaveClass('custom-compact');
  });
});
