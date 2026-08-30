import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function CaravaneiroLoading() {
  return (
    <div className="px-5 pt-6">
      <div className="mb-6 h-28 animate-pulse rounded-b-[34px] bg-blue-200/60" />
      <PageSkeleton rows={3} />
    </div>
  );
}
