import type { Option } from "~/product/types";
import type { CartItem } from "../types";
import type { ComponentProps } from "react";

import { useState, useMemo, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

import { parseCurrency } from "~/currency/utils";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { getCartItemPrice } from "../utils";

import ImageCarousel from "./ImageCarousel";

function CartItemDrawer({
  item,
  onClose,
  onSubmit,
  ...props
}: ComponentProps<typeof Sheet> & {
  item: CartItem;
  onClose: VoidFunction;
  onSubmit: (item: CartItem) => void;
}) {
  const [formData, setFormData] = useState<CartItem>(() => ({
    ...item,
    options: {},
  }));
  const [missingOptions, setMissingOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const total = useMemo(
    () => parseCurrency(getCartItemPrice(formData)),
    [formData],
  );
  const options = useMemo(
    () =>
      item.options
        ? Object.entries(item.options).map(([title, _options]) => ({
            title,
            options: _options,
          }))
        : [],
    [item],
  );

  const images = item.image || '';
  const videos = item.video || '';

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...item, options: {} });
      setMissingOptions([]);
    }
  }, [isOpen, item]);

  function handleSelectOption(option: Option) {
    setFormData((_formData) => ({
      ..._formData,
      options: { ...(_formData.options || {}), [option.category]: [option] },
    }));
    setMissingOptions((prevMissing) =>
      prevMissing.filter((title) => title !== option.category),
    );
  }

  function handleSubmit() {
    const missing = options
      .map((category) => category.title)
      .filter((title) => !formData.options?.[title]);

    if (missing.length > 0) {
      setMissingOptions(missing);
    } else {
      onSubmit(formData);
    }
  }

  return (
    <Sheet
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) onClose();
      }}
      {...props}
    >
      <SheetContent className="grid grid-rows-[auto_1fr_auto]">
        <SheetHeader>
          <SheetClose className="z-20 -mx-6 ml-auto h-12 w-14 rounded-l-lg border border-border bg-background py-2 pl-2 pr-4 shadow-lg">
            <X className="h-8 w-8" />
          </SheetClose>
        </SheetHeader>

        <div
          className={cn("overflow-y-auto", { "-mt-16": images || videos })}
          data-testid="cart-item-drawer"
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              {(images || videos) && (
                <ImageCarousel images={images} videos={videos} title={item.title} />
              )}
              <SheetTitle className="text-2xl font-medium">
                {item.title}
              </SheetTitle>
              <SheetDescription className="text-md whitespace-pre-wrap text-muted-foreground sm:text-lg">
                {item.description}
              </SheetDescription>
            </div>
            {Boolean(options.length) && (
              <div className="flex flex-col gap-8">
                {options.map((category) => {
                  const isMissing = missingOptions.includes(category.title);

                  return (
                    <div
                      key={category.title}
                      className="flex w-full flex-col gap-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">{category.title}</p>
                        {isMissing ? (
                          <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm">
                              Selecciona una opción
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <RadioGroup
                        value={formData.options?.[category.title]?.[0]?.title}
                      >
                        <div className="flex flex-col gap-4">
                          {category.options.map((option) => (
                            <div
                              key={option.title}
                              className="flex items-center gap-x-3"
                            >
                              <RadioGroupItem
                                id={option.title}
                                value={option.title}
                                onClick={() => {
                                  handleSelectOption(option);
                                }}
                              />
                              <Label className="w-full" htmlFor={option.title}>
                                <div className="flex w-full items-center justify-between gap-2">
                                  <p>{option.title}</p>
                                  {Boolean(option.price) && (
                                    <div className="flex items-center gap-1">
                                      <p className="text-muted-foreground">
                                        {option.price < 0 ? "-" : "+"}
                                      </p>
                                      <p className="font-medium">
                                        {parseCurrency(Math.abs(option.price))}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <div className="flex w-full flex-col gap-4">
            <hr />
            <div className="flex items-center justify-between text-lg font-medium">
              <p>Total</p>
              <p>{total}</p>
            </div>
            <Button
              className="w-full"
              size="lg"
              type="button"
              variant="brand"
              onClick={handleSubmit}
            >
              Agregar al pedido
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default CartItemDrawer;