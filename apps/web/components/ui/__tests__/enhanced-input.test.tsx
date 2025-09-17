import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedInput } from '../enhanced-input';

describe('EnhancedInput', () => {
  it('should render with default props', () => {
    render(<EnhancedInput placeholder='Enter text' />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-neutral-300');
  });

  it('should render with label', () => {
    render(<EnhancedInput label='Email' placeholder='Enter email' />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('should render with required label', () => {
    render(<EnhancedInput label='Email' required placeholder='Enter email' />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(
      <EnhancedInput error='This field is required' placeholder='Enter text' />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toHaveClass(
      'border-error'
    );
  });

  it('should render with helper text', () => {
    render(
      <EnhancedInput
        helperText='This is helper text'
        placeholder='Enter text'
      />
    );

    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { rerender } = render(
      <EnhancedInput variant='error' placeholder='Error' />
    );
    expect(screen.getByPlaceholderText('Error')).toHaveClass('border-error');

    rerender(<EnhancedInput variant='success' placeholder='Success' />);
    expect(screen.getByPlaceholderText('Success')).toHaveClass(
      'border-success'
    );

    rerender(<EnhancedInput variant='warning' placeholder='Warning' />);
    expect(screen.getByPlaceholderText('Warning')).toHaveClass(
      'border-warning'
    );
  });

  it('should render with left icon', () => {
    const LeftIcon = () => <span data-testid='left-icon'>@</span>;
    render(<EnhancedInput leftIcon={<LeftIcon />} placeholder='With icon' />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('should render with right icon', () => {
    const RightIcon = () => <span data-testid='right-icon'>✓</span>;
    render(<EnhancedInput rightIcon={<RightIcon />} placeholder='With icon' />);

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    const handleChange = jest.fn();
    render(<EnhancedInput onChange={handleChange} placeholder='Enter text' />);

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test value');
  });

  it('should handle focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    render(
      <EnhancedInput
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder='Enter text'
      />
    );

    const input = screen.getByPlaceholderText('Enter text');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<EnhancedInput disabled placeholder='Disabled' />);

    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<EnhancedInput className='custom-class' placeholder='Custom' />);

    const input = screen.getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-class');
  });

  it('should render with different input types', () => {
    const { rerender } = render(
      <EnhancedInput type='email' placeholder='Email' />
    );
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
      'type',
      'email'
    );

    rerender(<EnhancedInput type='password' placeholder='Password' />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
      'type',
      'password'
    );

    rerender(<EnhancedInput type='number' placeholder='Number' />);
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute(
      'type',
      'number'
    );
  });
});
