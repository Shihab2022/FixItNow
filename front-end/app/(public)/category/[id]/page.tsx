import CategoryTechniciansPage from "@/components/category/CategoryTechniciansPage";
import { getAllCategories } from "@/service/publicApi";

type Params = Promise<{ id: string }>;

export default async function CategoryTechniciansRoute({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  // Fetch the category name for display
  let categoryName: string | undefined;
  try {
    const res = await getAllCategories();
    const categories = res?.data?.data || [];
    const found = categories.find((c: any) => c.id === id);
    categoryName = found?.name;
  } catch {
    // ignore — category name is optional
  }

  return <CategoryTechniciansPage categoryId={id} categoryName={categoryName} />;
}