"use client";

import { Product } from "@/config/payload-types";
import { useEffect, useState } from "react";
import ProductPlaceholder from "./ProductPlaceholder";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import productCategories from "@/config/product-categories";
import ProductImgSlider from "./ProductImgSlider";

interface ProductListingProps {
  product: Product | null;
  index: number;
}

export default function ProductListing({
  product,
  index,
}: ProductListingProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => clearTimeout(timer);
  }, [index]);

  if (!product || !isVisible) return <ProductPlaceholder />;

  const label = productCategories.find(
    ({ value }) => value === product.category
  )?.label;

  const validUrl = product.images
    .map(({ image }) => (typeof image === "string" ? image : image.url))
    .filter(Boolean) as string[];

  if (isVisible && product) {
    return (
      <Link
        href={`/product/${product.id}`}
        className={cn("invisible h-full w-full cursor-pointer group/main", {
          "visible animate-in fade-in-5": isVisible,
        })}
      >
        <div className="flex flex-col w-full">
          <ProductImgSlider urls={validUrl} />
          <h3 className="mt-4 font-medium text-gray-700">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{label}</p>
          <p className="mt-1 font-medium text-sm text-gray-900">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    );
  }
}
