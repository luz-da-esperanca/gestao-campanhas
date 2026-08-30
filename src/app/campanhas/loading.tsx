import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function CampanhasLoading() {
  return (
    <div className="min-h-dvh soft-page">
      <div className="blue-gradient h-14 shadow-md" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <PageSkeleton rows={3} />
      </div>
    </div>
  );
}
