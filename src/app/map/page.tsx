import { getCurrentUser } from "@/lib/session";
import { getCareerMapData } from "@/lib/map-data";
import { CareerMap } from "@/components/career-map";

export default async function MapPage() {
  const user = await getCurrentUser();
  const offices = await getCareerMapData(user?.id ?? null);
  const savedEmployerIds = offices.filter((o) => o.isSaved).map((o) => o.employer.id);

  return (
    <div className="h-[calc(100vh-56px)] w-full">
      <CareerMap offices={offices} initialSavedEmployerIds={savedEmployerIds} />
    </div>
  );
}
