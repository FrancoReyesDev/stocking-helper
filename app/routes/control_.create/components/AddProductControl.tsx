import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useRef,
} from "react";
import CbItem from "~/types/CbItem.type";
import { ContabiliumProductsUtility } from "~/utilities/ContabiliumProducts.utility";
import { BackToProductToAddSkuInput } from "./BackToProductToAddSkuInput";

interface Props {
  productToAddSku: string;
  setProductToAddSku: Dispatch<SetStateAction<string>>;
  productToAddQuantity: number;
  setProductToAddQuantity: Dispatch<SetStateAction<number>>;
  clearProductToAddFields(): void;

  searchProductResults: CbItem[];
  setSearchProductResults: Dispatch<SetStateAction<CbItem[]>>;
  addProduct(sku: string): void;
  contabiliumProductsUtility: ContabiliumProductsUtility;
}

export function AddProductControl({
  productToAddSku,
  setProductToAddSku,
  productToAddQuantity,
  addProduct,
  setProductToAddQuantity,
  clearProductToAddFields,
  setSearchProductResults,
  contabiliumProductsUtility,
}: Props) {
  const productToAddSkuRef = useRef<HTMLInputElement>(null);

  function handleProductToAddSkuChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value ?? "";

    setProductToAddSku(newValue);

    if (newValue.trim() === "") return clearProductToAddFields();

    const searchResults = contabiliumProductsUtility.searchProduct(newValue);
    setSearchProductResults(searchResults);
  }

  function handleProdductToAddQuantityChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const newValue = event.target.value;

    const newValueToNumber = Number(newValue);

    if (isNaN(newValueToNumber)) return setProductToAddQuantity(1);

    setProductToAddQuantity(newValueToNumber);
  }

  function handleOnKeyUpEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && productToAddSku.trim() !== "") {
      const target = event.target as HTMLInputElement;
      const sku = target.value;
      setProductToAddSku(sku);
      addProduct(sku.trim());
    }
  }

  return (
    <>
      <label className="form-control w-full grow gap-x-2 grid grid-cols-6 grid-rows-2 ">
        <div className="label grid col-span-6">
          <span className="label-text">Agregar Producto</span>
        </div>
        <input
          ref={productToAddSkuRef}
          type="text"
          name="add-product"
          placeholder="sku"
          className="input input-bordered w-full col-span-5"
          value={productToAddSku}
          onChange={handleProductToAddSkuChange}
          onKeyUp={handleOnKeyUpEnter}
          maxLength={50}
        />
        <input
          type="number"
          min={1}
          className="input input-bordered col-span-1"
          value={String(productToAddQuantity ?? "")}
          onChange={handleProdductToAddQuantityChange}
          onKeyUp={handleOnKeyUpEnter}
          max={500}
        />
      </label>

      <BackToProductToAddSkuInput productToAddSkuRef={productToAddSkuRef} />
    </>
  );
}
