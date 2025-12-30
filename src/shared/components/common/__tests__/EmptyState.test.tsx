import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  EmptyState,
  NoAppraisalsEmptyState,
  NoOrdersEmptyState,
  NoJobsEmptyState,
  NoSearchResultsEmptyState,
  ErrorEmptyState,
} from '../EmptyState';
import { AlertCircle } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="No data" description="Try adjusting your filters" />);
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('renders primary action button when provided', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: 'Create New', onClick: handleClick }}
      />
    );

    const button = screen.getByRole('button', { name: 'Create New' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders secondary action button when provided', () => {
    const handlePrimary = vi.fn();
    const handleSecondary = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: 'Create', onClick: handlePrimary }}
        secondaryAction={{ label: 'Learn More', onClick: handleSecondary }}
      />
    );

    const secondaryButton = screen.getByRole('button', { name: 'Learn More' });
    expect(secondaryButton).toBeInTheDocument();

    fireEvent.click(secondaryButton);
    expect(handleSecondary).toHaveBeenCalledTimes(1);
  });

  it('renders custom icon when provided', () => {
    const { container } = render(
      <EmptyState title="Custom" icon={AlertCircle} />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState title="Test" className="custom-empty-state" />
    );
    expect(container.firstChild).toHaveClass('custom-empty-state');
  });

  it('uses default icon based on type', () => {
    const { container } = render(<EmptyState title="Test" type="no-results" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('NoAppraisalsEmptyState', () => {
  it('renders correct title and description', () => {
    render(<NoAppraisalsEmptyState onCreateNew={() => {}} />);
    expect(screen.getByText('No appraisals yet')).toBeInTheDocument();
    expect(
      screen.getByText('Get started by creating your first AI-powered property appraisal.')
    ).toBeInTheDocument();
  });

  it('calls onCreateNew when button is clicked', () => {
    const handleCreate = vi.fn();
    render(<NoAppraisalsEmptyState onCreateNew={handleCreate} />);

    fireEvent.click(screen.getByRole('button', { name: 'New Appraisal' }));
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });
});

describe('NoOrdersEmptyState', () => {
  it('renders correct title and description', () => {
    render(<NoOrdersEmptyState onCreateNew={() => {}} />);
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
    expect(
      screen.getByText('Order an on-site inspection for more detailed property valuations.')
    ).toBeInTheDocument();
  });

  it('calls onCreateNew when button is clicked', () => {
    const handleCreate = vi.fn();
    render(<NoOrdersEmptyState onCreateNew={handleCreate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Order' }));
    expect(handleCreate).toHaveBeenCalledTimes(1);
  });
});

describe('NoJobsEmptyState', () => {
  it('renders correct title and description', () => {
    render(<NoJobsEmptyState />);
    expect(screen.getByText('No available jobs')).toBeInTheDocument();
    expect(
      screen.getByText('Check back later for new inspection jobs in your area.')
    ).toBeInTheDocument();
  });

  it('does not render action button', () => {
    render(<NoJobsEmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('NoSearchResultsEmptyState', () => {
  it('renders correct title with query', () => {
    render(<NoSearchResultsEmptyState query="test search" onClear={() => {}} />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(
      screen.getByText('We couldn\'t find anything matching "test search". Try adjusting your search.')
    ).toBeInTheDocument();
  });

  it('calls onClear when button is clicked', () => {
    const handleClear = vi.fn();
    render(<NoSearchResultsEmptyState query="test" onClear={handleClear} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorEmptyState', () => {
  it('renders default error message', () => {
    render(<ErrorEmptyState />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    render(<ErrorEmptyState message="Network error occurred" />);
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorEmptyState onRetry={handleRetry} />);

    const button = screen.getByRole('button', { name: 'Try Again' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorEmptyState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
