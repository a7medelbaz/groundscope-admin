import React from "react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-grey-200 border-t-primary-200 mb-4" />
      {message && (
        <p className="text-text-secondary text-sm">{message}</p>
      )}
    </div>
  );
}
