import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import CbItem from "~/types/CbItem.type";
import { ControlProduct } from "~/types/Control.type";

const defaultProduct: ControlProduct = {
  uuid: "",
  sku: "",
  ids: [],
  title: "",
  quantity: 1,
  details: "",
};

interface Props {
  contabiliumIndexedProductsBySku: {
    [sku: string]: CbItem;
  };
  addProduct(product: ControlProduct): void;
  searchProduct(product: ControlProduct): ControlProduct | undefined;
}

export default function ControlProducts({
  contabiliumIndexedProductsBySku,
  searchProduct,
  addProduct,
}: Props) {
  const [newProduct, setNewProduct] = useState<ControlProduct>(defaultProduct);
  const [idsToString, setIdsToString] = useState(newProduct.ids.join(", "));
  const idsFieldRef = useRef<HTMLInputElement>(null);

  function handleChangeProductField(field: keyof ControlProduct) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue =
        field === "quantity"
          ? Number(event.target.value) || 1
          : event.target.value;

      setNewProduct((currentProduct) => ({
        ...currentProduct,
        [field]: newValue,
      }));
    };
  }

  function handleChangeProductIds(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setIdsToString(value);
  }

  function handleClearForm() {
    setNewProduct({ ...defaultProduct });
    setIdsToString("");
    idsFieldRef.current?.focus();
  }

  function handleAddProduct() {
    if (newProduct.sku === "" && newProduct.ids.length === 0) return;

    addProduct(newProduct);
    handleClearForm();
  }

  function handlePressingEnterOnId(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const value = idsToString
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    if (!searchProduct(newProduct))
      return setIdsToString(value.join(", ") + ", ");
    handleAddProduct();
  }

  function handleSearchOnContabiliumByPressingEnter(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    const sku = (event.target as HTMLInputElement).value.trim();

    if (
      event.key === "Enter" &&
      sku !== "" &&
      sku in contabiliumIndexedProductsBySku &&
      newProduct.title === ""
    ) {
      const cbProduct = contabiliumIndexedProductsBySku[sku];

      setNewProduct(({ title, ...rest }) => ({
        ...rest,
        title: cbProduct.nombre,
      }));
    }
  }

  useEffect(() => {
    if (idsToString !== "") {
      const ids = idsToString
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "");
      setNewProduct((currentProduct) => ({
        ...currentProduct,
        ids,
      }));
    }
  }, [idsToString]);

  return (
    <>
      <header className="prose mt-4">
        <h3>Agregar Producto</h3>
      </header>
      <div className="flex flex-col gap-1">
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Codigo</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              ref={idsFieldRef}
              className="grow"
              placeholder="Podes apretar enter para agregar por codigo o sku si es que ya esta agregado"
              onChange={handleChangeProductIds}
              onKeyDown={handlePressingEnterOnId}
              value={idsToString}
            />
            <kbd className="kbd kbd-sm">enter</kbd>
          </label>
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Sku</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Podes apretar enter para buscar en contabilium"
              onChange={handleChangeProductField("sku")}
              onKeyDown={handleSearchOnContabiliumByPressingEnter}
              value={newProduct.sku}
            />
            <kbd className="kbd kbd-sm">enter</kbd>
          </label>
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Titulo</span>
          </div>
          <input
            type="text"
            className="input input-bordered"
            onChange={handleChangeProductField("title")}
            value={newProduct.title}
            placeholder={
              contabiliumIndexedProductsBySku?.[newProduct.sku.trim()]
                ?.nombre || ""
            }
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Cantidad</span>
          </div>
          <input
            type="number"
            className="input input-bordered"
            min={1}
            onChange={handleChangeProductField("quantity")}
            value={newProduct.quantity}
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Detalles</span>
          </div>
          <textarea
            className="textarea textarea-bordered"
            onChange={handleChangeProductField("details")}
            value={newProduct.details}
          />
        </label>
        <div className="flex gap-1 mt-4">
          <button onClick={handleAddProduct} className="btn  btn-neutral">
            agregar
          </button>
          <button onClick={handleClearForm} className="btn btn-warning">
            limpiar
          </button>
        </div>
      </div>
    </>
  );
}
