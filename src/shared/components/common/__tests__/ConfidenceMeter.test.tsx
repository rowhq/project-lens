import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceMeter, ConfidenceDisplay } from '../ConfidenceMeter';

describe('ConfidenceMeter', () => {
  it('renders confidence percentage', () => {
    render(<ConfidenceMeter score={85} showTooltip={false} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('displays high confidence for scores >= 85', () => {
    render(<ConfidenceDisplay score={90} />);
    expect(screen.getByText('High Confidence')).toBeInTheDocument();
  });

  it('displays good confidence for scores 70-84', () => {
    render(<ConfidenceDisplay score={75} />);
    expect(screen.getByText('Good Confidence')).toBeInTheDocument();
  });

  it('displays moderate confidence for scores 55-69', () => {
    render(<ConfidenceDisplay score={60} />);
    expect(screen.getByText('Moderate Confidence')).toBeInTheDocument();
  });

  it('displays low confidence for scores < 55', () => {
    render(<ConfidenceDisplay score={45} />);
    expect(screen.getByText('Low Confidence')).toBeInTheDocument();
  });

  it('clamps values to 0-100 range', () => {
    const { rerender } = render(<ConfidenceMeter score={150} showTooltip={false} />);
    expect(screen.getByText('100%')).toBeInTheDocument();

    rerender(<ConfidenceMeter score={-10} showTooltip={false} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<ConfidenceMeter score={85} showLabel={false} showTooltip={false} />);
    expect(screen.queryByText('85%')).not.toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<ConfidenceMeter score={85} size="sm" showTooltip={false} />);
    expect(container.querySelector('.w-24')).toBeInTheDocument();

    rerender(<ConfidenceMeter score={85} size="md" showTooltip={false} />);
    expect(container.querySelector('.w-32')).toBeInTheDocument();

    rerender(<ConfidenceMeter score={85} size="lg" showTooltip={false} />);
    expect(container.querySelector('.w-40')).toBeInTheDocument();
  });
});

describe('ConfidenceDisplay', () => {
  it('renders the score percentage', () => {
    render(<ConfidenceDisplay score={85} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('shows appropriate description for high confidence', () => {
    render(<ConfidenceDisplay score={90} />);
    expect(screen.getByText('Strong comparable data supports this valuation.')).toBeInTheDocument();
  });

  it('shows appropriate description for moderate confidence', () => {
    render(<ConfidenceDisplay score={60} />);
    expect(screen.getByText('Consider ordering an on-site inspection.')).toBeInTheDocument();
  });

  it('shows appropriate description for low confidence', () => {
    render(<ConfidenceDisplay score={40} />);
    expect(screen.getByText('On-site inspection strongly recommended.')).toBeInTheDocument();
  });
});
