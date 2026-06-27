"use client";

import { Button } from "@/components/ui/button";

export function EnquiryActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" disabled>
        Mark contacted
      </Button>
      <Button type="button" variant="outline" disabled>
        Send proposal
      </Button>
      <Button type="button" disabled>
        Convert to event
      </Button>
      <Button type="button" variant="outline" disabled>
        Mark lost
      </Button>
    </div>
  );
}
