import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title = 'No data found',
  message = 'There are no items to display.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <div className="text-center">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      {action}
    </div>
  );
}
