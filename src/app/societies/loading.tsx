import { LoadingSkeleton } from "@/components/layout/status-views";

export default function SocietiesLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <LoadingSkeleton label="Loading" />
    </div>
  );
}
