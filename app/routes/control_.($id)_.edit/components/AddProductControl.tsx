import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  SetStateAction,
  useRef,
} from "react";
import CbItem from "~/types/CbItem.type";
import { ContabiliumProductsUtility } from "~/utilities/ContabiliumProducts.utility";
import { BackToProductToAddSkuInput } from "./BackToProductToAddSkuInput";
import { CameraIcon } from "~/components/icons/Camera.Icom";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import BarcodeScannerModal from "./BarcodeScannerModal";

interface Props {
  productToAddSku: string;
  setProductToAddSku: Dispatch<SetStateAction<string>>;
  productToAddQuantity: number;
  setProductToAddQuantity: Dispatch<SetStateAction<number>>;
  clearProductToAddFields(): void;
  onlySearchMode: boolean;
  setOnlySearchMode: Dispatch<SetStateAction<boolean>>;
  searchProductResults: CbItem[];
  setSearchProductResults: Dispatch<SetStateAction<CbItem[]>>;
  addProduct(sku: string): void;
  contabiliumProductsUtility: ContabiliumProductsUtility;
  productRefs: { [sku: string]: RefObject<HTMLDivElement> };
}

export function AddProductControl({
  productToAddSku,
  setProductToAddSku,
  productToAddQuantity,
  onlySearchMode,
  setOnlySearchMode,
  addProduct,
  setProductToAddQuantity,
  clearProductToAddFields,
  setSearchProductResults,
  productRefs,
  contabiliumProductsUtility,
}: Props) {
  const productToAddSkuRef = useRef<HTMLInputElement>(null);
  const { openDialog, setOpenDialog, setHtml5QrBarcode, html5QrCode } =
    useBarcodeScanner();

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
      setProductToAddSku(sku.trim());

      if (!onlySearchMode) addProduct(sku.trim());
      else if (sku.trim() in productRefs) {
        const productRef = productRefs[sku.trim()];
        productRef.current?.scrollIntoView();
      }
    }
  }

  function handleOpenCamera(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOpenDialog(true);
  }

  function handleChangeOnlySearchMode(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;

    setOnlySearchMode(checked);
  }

  return (
    <>
      <label className="form-control w-full grow gap-x-2 grid grid-cols-6 grid-rows-2 ">
        <div className="label grid col-span-6">
          <span className="label-text">Buscar Producto</span>
        </div>
        <label className="input input-bordered flex items-center gap-2 col-span-5">
          <input
            ref={productToAddSkuRef}
            type="text"
            name="add-product"
            placeholder="sku"
            className="grow "
            value={productToAddSku}
            onChange={handleProductToAddSkuChange}
            onKeyUp={handleOnKeyUpEnter}
            maxLength={50}
          />
          <button onClick={handleOpenCamera} className="btn btn-sm btn-ghost">
            <CameraIcon />
          </button>
        </label>

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

      <div className="form-control max-w-content">
        <label className="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            checked={onlySearchMode}
            onChange={handleChangeOnlySearchMode}
            className="checkbox"
          />
          <span className="label-text">Solo busqueda</span>
        </label>
      </div>

      <BackToProductToAddSkuInput productToAddSkuRef={productToAddSkuRef} />
      <BarcodeScannerModal
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        setHtml5QrBarcode={setHtml5QrBarcode}
        html5QrCode={html5QrCode}
      />
    </>
  );
}
