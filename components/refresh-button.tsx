"use client";

import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export function RefreshButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => window.location.reload()}
    >
      <RefreshCcw className="h-4 w-4" />
      Refresh
    </Button>
  );
}
