// ProductCard.tsx

import type { CartItem } from "~/cart/types";
import type { Product } from "../types";
import { useState, useMemo } from "react";
import CartItemDrawer from "~/cart/components/CartItemDrawer";
import { parseCurrency } from "~/currency/utils";
import ImageCarousel from "./ImageCarousel";

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cartItem = useMemo<CartItem>(
    () => ({ ...product, quantity: 1 }),
    [product],
  );

  return (
    <>
      <div
        key={product.id}
        className="border-white/300 flex cursor-pointer items-center justify-between gap-3 rounded-md border"
        data-testid="product"
        role="button"
        tabIndex={0}
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <div className="flex h-full w-full gap-4 p-4">
          <div className="flex w-full flex-col justify-between gap-1">
            <div className="flex flex-col gap-1">
              <p className="line-clamp-[1] font-medium sm:line-clamp-[2]">
                {product.title}
              </p>
              <p className="line-clamp-[2] text-sm text-muted-foreground sm:line-clamp-3">
                {product.description}
              </p>
            </div>
            <div className="flex items-end">
              <p className="text-sm font-medium text-incentive">
                {parseCurrency(product.price)}
              </p>
            </div>
          </div>
          <ImageCarousel images={product.image} videos={product.video} title={product.title} />
        </div>
      </div>
      {isModalOpen ? (
        <CartItemDrawer
          open
          item={cartItem}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onSubmit={(item: CartItem) => {
            onAdd(item);
            setIsModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

export default ProductCard;