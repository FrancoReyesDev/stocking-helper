import { MouseEvent } from "react";
import CbItem from "~/types/CbItem.type";

interface Props {
  searchProductResults: CbItem[];
  addProduct(sku: string): void;
}

export function AddProductSuggestions({
  searchProductResults,
  addProduct,
}: Props) {
  function getHandleAddItem(sku: string) {
    return function (event: MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      addProduct(sku);
    };
  }

  return searchProductResults.slice(0, 10).map(({ sku, nombre }) => (
    <div
      key={sku}
      className="flex justify-between border rounded p-2 items-center"
    >
      <div className="flex flex-col gap-1 ml-2">
        <span>
          <strong>sku:</strong> {sku}
        </span>
        <span>
          <strong>nombre:</strong> {nombre}
        </span>
      </div>
      <button className="btn" onClick={getHandleAddItem(sku)}>
        agregar
      </button>
    </div>
  ));
}
