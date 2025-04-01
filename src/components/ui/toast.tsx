import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

export const toast = ({ title, description, duration = 3000, variant = 'default' }: ToastOptions) => {
  sonnerToast[variant === 'destructive' ? 'error' : 'success'](title, {
    description,
    duration
  });
};
