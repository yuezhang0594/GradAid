import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/ui/page-wrapper";

/**
 * A component that throws an error when a button is clicked
 * Used for demonstrating error boundary functionality
 */
function ErrorButton() {
  const [_shouldThrow, setShouldThrow] = useState(false);

  if (_shouldThrow) {
    // This will intentionally throw an error when the button is clicked
    throw new Error(
      "This is an intentional error thrown by the ErrorBoundaryExample component"
    );
  }

  return (
    <Button
      onClick={() => setShouldThrow(true)}
      variant="destructive"
      className="mt-4"
    >
      Throw Error
    </Button>
  );
}

export function ErrorBoundaryExample() {
  return (
    <PageWrapper
      title="Error Boundary Example"
      description="Click the button below to trigger an error"
    >
      <ErrorButton />
    </PageWrapper>
  );
}
