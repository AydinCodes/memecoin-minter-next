import GuideHeader from "@/components/guides/guide-header";
import GuidesList from "@/components/guides/guides-list";
import ResourcesList from "@/components/guides/resources-list";

export default function Guides() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GuideHeader />
        <GuidesList />
        <ResourcesList />
      </div>
    </div>
  );
}