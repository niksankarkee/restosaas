import { ReactNode } from 'react';
import { Button } from '@restosaas/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@restosaas/ui';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className }: DialogContentProps) {
  return <div className={className}>{children}</div>;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className='p-6 border-b'>{children}</div>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className='text-xl font-semibold text-gray-900'>{children}</h2>;
}

export function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  return <>{children}</>;
}
