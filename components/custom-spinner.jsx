import { Spinner } from "@heroui/react";

export default function CustomSpinner({ isLoading, children }) {
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 bg-opacity-75 z-50">
          <Spinner size="lg" />
        </div>
      )}
      {children}
    </div>
  );
}
