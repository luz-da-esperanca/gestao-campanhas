import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <PageSkeleton rows={4} />
    </div>
  );
}
