import MaxWidthWrapper from "@/components/layout/MaxWidthWrapper";
import ProductReel from "@/components/product/ProductReel";
import productCategories from "@/config/product-categories";

type Param = string | string[] | undefined;

interface ProductsPageProps {
  searchParams: { [key: string]: Param };
}

const parse = (param: Param) => {
  return typeof param === "string" ? param : undefined;
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const sort = parse(searchParams.sort);
  const category = parse(searchParams.category);

  const label = productCategories.find(
    ({ value }) => value === category
  )?.label;

  return (
    <MaxWidthWrapper>
      <ProductReel
        title={label ?? "Browse high-quality assets"}
        query={{
          category,
          limit: 40,
          sort: sort === "desc" || sort === "asc" ? sort : undefined,
        }}
      />
    </MaxWidthWrapper>
  );
}
