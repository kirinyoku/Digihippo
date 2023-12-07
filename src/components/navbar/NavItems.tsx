"use client";

import { useEffect, useRef, useState } from "react";
import productCategories from "@/config/product-categories";
import NavItem from "./NavItem";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export default function NavItems() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const isAnyOpen = activeIndex !== null;

  useOnClickOutside(navRef, () => setActiveIndex(null));

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    }

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <div className="flex gap-4 h-full" ref={navRef}>
      {productCategories.map((category, index) => {
        function handleOpen() {
          if (activeIndex === index) {
            setActiveIndex(null);
          } else {
            setActiveIndex(index);
          }
        }
        const isOpen = index === activeIndex;

        return (
          <NavItem
            category={category}
            handleOpen={handleOpen}
            isOpen={isOpen}
            isAnyOpen={isAnyOpen}
            key={category.value}
          />
        );
      })}
    </div>
  );
}
