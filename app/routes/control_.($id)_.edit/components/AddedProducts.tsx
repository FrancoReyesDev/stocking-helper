import { Fragment } from "react/jsx-runtime";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
} from "react";
import { Control } from "~/types/Control.type";

interface AddedProductProps {
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

export function AddedProduct({
  index,
  product,
  getHandleChangeProduct,
  getHandleDeleteProduct,
}: AddedProductProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product.name === "") {
      nameInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      nameInputRef.current?.focus();
    }
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

interface Props {
  products: Control["products"];
  setControl: Dispatch<SetStateAction<Control>>;
}

export function AddedProducts({ products, setControl }: Props) {
  function getHandleChangeProduct(
    field: keyof Control["products"][number],
    sku: string
  ) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue = event.target.value ?? (field === "quantity" ? 1 : "");

      const newProduct = {
        ...products.find((product) => product.sku === sku),
        [field]: newValue,
      } as Control["products"][number];

      setControl((control) => ({
        ...control,
        products: products.map((product) =>
          product.sku !== sku ? product : newProduct
        ),
      }));
    };
  }

  function getHandleDeleteProduct(sku: string) {
    return function (event: MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      setControl((control) => ({
        ...control,
        products: products.filter((product) => product.sku !== sku),
      }));
    };
  }

  return products.map((product, index) => (
    <Fragment key={product.sku}>
      {index === 0 && <div className="divider"></div>}

      <AddedProduct
        index={index}
        product={product}
        getHandleChangeProduct={getHandleChangeProduct}
        getHandleDeleteProduct={getHandleDeleteProduct}
      />
      {products.length > 0 && <div className="divider"></div>}
    </Fragment>
  ));
}
