import TechProfile from "@/components/dashboard/customer/techProfile";

type Params = Promise<{ id: string }>;
export default async function TechnicianProfile({
  params,
}: {
  params: Params;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  return (
    <div>
      <TechProfile technicianId={id} />
    </div>
  );
}
