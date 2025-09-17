import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedButton } from '../enhanced-button';

describe('EnhancedButton', () => {
  it('should render with default props', () => {
    render(<EnhancedButton>Click me</EnhancedButton>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('should render with different variants', () => {
    const { rerender } = render(
      <EnhancedButton variant='destructive'>Delete</EnhancedButton>
    );
    expect(screen.getByRole('button')).toHaveClass('bg-error');

    rerender(<EnhancedButton variant='outline'>Outline</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('border');

    rerender(<EnhancedButton variant='secondary'>Secondary</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(
      <EnhancedButton size='sm'>Small</EnhancedButton>
    );
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<EnhancedButton size='lg'>Large</EnhancedButton>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('should show loading state', () => {
    render(<EnhancedButton loading>Loading</EnhancedButton>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should render with left icon', () => {
    const LeftIcon = () => <span data-testid='left-icon'>←</span>;
    render(<EnhancedButton leftIcon={<LeftIcon />}>With Icon</EnhancedButton>);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('should render with right icon', () => {
    const RightIcon = () => <span data-testid='right-icon'>→</span>;
    render(
      <EnhancedButton rightIcon={<RightIcon />}>With Icon</EnhancedButton>
    );

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<EnhancedButton onClick={handleClick}>Click me</EnhancedButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(
      <EnhancedButton loading onClick={jest.fn()}>
        Loading
      </EnhancedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<EnhancedButton disabled>Disabled</EnhancedButton>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render as different element when asChild is true', () => {
    render(
      <EnhancedButton asChild>
        <a href='/test'>Link Button</a>
      </EnhancedButton>
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should apply custom className', () => {
    render(<EnhancedButton className='custom-class'>Custom</EnhancedButton>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
