"use client";

import type {CartItem} from "~/cart/types";

import type {Product} from "../types";

import {useState, useMemo} from "react";
import {ImageOff} from "lucide-react";

import CartItemDrawer from "~/cart/components/CartItemDrawer";
import {parseCurrency} from "~/currency/utils";
import ImageCarousel from "./ImageCarousel"; // Add Animation between product images

function ProductCard({product, onAdd}: {product: Product; onAdd: (product: Product) => void}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cartItem = useMemo<CartItem>(() => ({...product, quantity: 1}), [product]);

  // Split the image string into an array of image paths
  const imagePaths = product.image ? product.image.split(",").map(path => path.trim()) : [];

  return (
    <>
      <div
        key={product.id}
        className="border-white/300 flex cursor-pointer items-center justify-between gap-3 rounded-md border"
        data-testid="product"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <div className="flex h-full w-full gap-4 p-4">
          <div className="flex w-full flex-col justify-between gap-1">
            <div className="flex flex-col gap-1">
              <p className="line-clamp-[1] font-medium sm:line-clamp-[2]">{product.title}</p>
              <p className="line-clamp-[2] text-sm text-muted-foreground sm:line-clamp-3">
                {product.description}
              </p>
            </div>
            <div className="flex items-end">
              <p className="text-sm font-medium text-incentive">{parseCurrency(product.price)}</p>
            </div>
          </div>
          <ImageCarousel images={imagePaths} title={product.title} />
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
