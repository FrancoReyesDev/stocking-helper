import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CbItem from "~/types/CbItem.type";
import { ControlProduct } from "~/types/Control.type";
import _ from "lodash";

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
  const skuFieldRef = useRef<HTMLInputElement>(null);

  const audios = useMemo(() => {
    if (typeof window === undefined) return undefined;
    const addedProductAudio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3"
    );
    const tabToSkuAudio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2841/2841-preview.mp3"
    );

    return { addedProductAudio, tabToSkuAudio };
  }, []);

  function handleChangeProductField(field: keyof ControlProduct) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue =
        field === "quantity"
          ? Number(event.target.value) || ""
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
    audios?.addedProductAudio.play();
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

  function handlePressingEnterOnSku(event: KeyboardEvent<HTMLInputElement>) {
    const sku = (event.target as HTMLInputElement).value.trim();

    if (
      event.key !== "Enter" ||
      sku === "" ||
      !(sku in contabiliumIndexedProductsBySku) ||
      newProduct.title !== ""
    )
      return;

    const cbProduct = contabiliumIndexedProductsBySku[sku];

    setNewProduct(({ title, ...rest }) => ({
      ...rest,
      title: cbProduct.nombre,
    }));

    console.log(newProduct.ids);

    if (newProduct.ids.length !== 0) {
      console.log("mas de uno");
      handleAddProduct();
    }
  }

  useEffect(() => {
    if (idsToString !== "") {
      const ids = idsToString
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "");

      const uniqueIds = _.uniq(ids);
      const hasDuplicates = _.size(ids) !== _.size(uniqueIds);

      setNewProduct((currentProduct) => ({
        ...currentProduct,
        uniqueIds,
      }));

      if (hasDuplicates) {
        audios?.tabToSkuAudio.play();
        setIdsToString(uniqueIds.join(", "));
        skuFieldRef.current?.focus();
      }
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
              onKeyDown={handlePressingEnterOnSku}
              ref={skuFieldRef}
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
