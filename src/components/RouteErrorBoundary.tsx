import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useEffect } from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { ErrorFallback } from './ErrorFallback';
export function RouteErrorBoundary() {
  // Hook is now at the top-level, called unconditionally.
  const error = useRouteError();
  useEffect(() => {
    if (error) {
      let errorMessage = 'Unknown route error';
      let errorStack = '';
      if (isRouteErrorResponse(error)) {
        errorMessage = `Route Error ${error.status}: ${error.statusText}`;
        if (error.data) {
          errorMessage += ` - ${JSON.stringify(error.data)}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        try {
          errorMessage = JSON.stringify(error);
        } catch {
          errorMessage = 'Unserializable route error';
        }
      }
      console.error("Route Error Boundary Caught:", { errorMessage, error });
      errorReporter.report({
        message: errorMessage,
        stack: errorStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        source: 'react-router',
        error: error,
        level: "error",
      });
    }
  }, [error]);
  // Render error UI using shared ErrorFallback component
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      {isRouteErrorResponse(error) ? (
        <ErrorFallback
          title={`${error.status} ${error.statusText}`}
          message="Sorry, an error occurred while loading this page."
          error={error.data ? { message: JSON.stringify(error.data, null, 2) } : error}
          statusMessage="Navigation error detected"
        />
      ) : (
        <ErrorFallback
          title="Unexpected Error"
          message="An unexpected error occurred while loading this page."
          error={error}
          statusMessage="Routing error detected"
        />
      )}
    </div>
  );
}