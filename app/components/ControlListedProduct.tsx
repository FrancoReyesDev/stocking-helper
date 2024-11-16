import { ChangeEvent, MouseEvent, useEffect, useRef } from "react";
import { Control } from "~/types/Control.type";

interface Props {
  index: number;
  product: Control["products"][number];
  getHandleChangeProduct(
    field: keyof Control["products"][number],
    sku: string
  ): (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  getHandleDeleteProduct(
    sku: string
  ): (event: MouseEvent<HTMLButtonElement>) => void;
}

export function ControlListedProduct({
  index,
  product,
  getHandleChangeProduct,
  getHandleDeleteProduct,
}: Props) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product.name === "")
      nameInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    nameInputRef.current?.focus();
  }, []);

  return (
    <div key={index} className="grid gap-2 bordered ">
      <input
        type="text"
        className="input input-bordered"
        name={"product-sku-" + index}
        placeholder="sku"
        value={product.sku}
        onChange={getHandleChangeProduct("sku", product.sku)}
      />
      <input
        ref={nameInputRef}
        type="text"
        placeholder="titulo"
        name={"product-name-" + index}
        className="input input-bordered"
        value={product.name}
        onChange={getHandleChangeProduct("name", product.sku)}
      />
      <input
        type="number"
        className="input input-bordered"
        placeholder="stock"
        name={"product-quantity-" + index}
        value={product.quantity}
        onChange={getHandleChangeProduct("quantity", product.sku)}
      />
      <textarea
        className="textarea textarea-bordered"
        name={"product-details-" + index}
        value={product.details}
        placeholder="detalles"
        onChange={getHandleChangeProduct("details", product.sku)}
      />
      <button
        onClick={getHandleDeleteProduct(product.sku)}
        className="btn btn-sm btn-block btn-error"
      >
        eliminar
      </button>
    </div>
  );
}
