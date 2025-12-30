import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders select element with options', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select label="Select an option" options={mockOptions} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders placeholder option when provided', () => {
    render(<Select options={mockOptions} placeholder="Choose..." />);
    expect(screen.getByText('Choose...')).toBeInTheDocument();
  });

  it('placeholder option is disabled', () => {
    render(<Select options={mockOptions} placeholder="Choose..." />);
    const placeholderOption = screen.getByText('Choose...') as HTMLOptionElement;
    expect(placeholderOption).toBeDisabled();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Select options={mockOptions} error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Select options={mockOptions} error="Error" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('renders disabled options correctly', () => {
    const optionsWithDisabled = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2', disabled: true },
    ];
    render(<Select options={optionsWithDisabled} />);

    const options = screen.getAllByRole('option');
    const disabledOption = options.find((opt) => opt.textContent === 'Option 2');
    expect(disabledOption).toBeDisabled();
  });

  it('handles disabled state', () => {
    render(<Select options={mockOptions} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('handles required attribute', () => {
    render(<Select options={mockOptions} required />);
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  it('applies custom className', () => {
    render(<Select options={mockOptions} className="custom-select" />);
    expect(screen.getByRole('combobox')).toHaveClass('custom-select');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Select options={mockOptions} ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('has chevron icon indicator', () => {
    const { container } = render(<Select options={mockOptions} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correct number of options', () => {
    render(<Select options={mockOptions} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('renders correct number of options with placeholder', () => {
    render(<Select options={mockOptions} placeholder="Select..." />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4); // 3 options + 1 placeholder
  });
});
