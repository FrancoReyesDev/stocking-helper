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
import { i } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import printOnRemotePrinter from "~/lib/printOnRemotePrinter";

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
  const [fastAddMode, setFastAddMode] = useState(false);
  // const [mask, setMask] = useState("");

  const idsFieldRef = useRef<HTMLInputElement>(null);
  const skuFieldRef = useRef<HTMLInputElement>(null);
  const [audios, setAudios] = useState<{
    addedProductAudio?: HTMLAudioElement;
    tabToSkuAudio?: HTMLAudioElement;
  }>({ addedProductAudio: undefined, tabToSkuAudio: undefined });
  const [remotePrint, setRemotePrint] = useState(false);
  const [remotePrintHost, setRemotePrintHost] = useState("");

  useEffect(() => {
    const addedProductAudio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3"
    );
    const tabToSkuAudio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2841/2841-preview.mp3"
    );

    setAudios({ addedProductAudio, tabToSkuAudio });
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

  function handleAddProduct(product?: ControlProduct) {
    audios.addedProductAudio?.play();
    addProduct(newProduct);
    handleClearForm();
    if (remotePrint)
      printOnRemotePrinter({
        host: remotePrintHost,
        label: {
          sku: (product ?? newProduct).sku,
          title: (product ?? newProduct).title,
          quantity: (product ?? newProduct).quantity,
        },
      });
  }

  function handlePressingEnterOnId(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const value = idsToString
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    const newValue = value.join(", ");

    setIdsToString(newValue === "" ? newValue : newValue + ", ");
  }

  function trySku(sku: string) {
    if (
      sku !== "" &&
      sku in contabiliumIndexedProductsBySku &&
      newProduct.title === ""
    ) {
      const cbProduct = contabiliumIndexedProductsBySku[sku];

      setNewProduct(({ title, ...rest }) => ({
        ...rest,
        sku,
        title: cbProduct.nombre,
      }));
    }
  }

  function handlePressingEnterOnSku(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const sku = (event.target as HTMLInputElement).value.trim();
    trySku(sku);
  }

  // function handleFocusOnSku() {
  //   if (
  //     mask !== "" &&
  //     newProduct.ids.length > 0 &&
  //     newProduct.title === "" &&
  //     newProduct.sku === ""
  //   ) {
  //     const regexForIdIndex = /\b(\d+)\./;
  //     const matchIdIndex = mask.match(regexForIdIndex);
  //     const idIndex = matchIdIndex ? matchIdIndex[1] : null;

  //     if (idIndex === null || isNaN(Number(idIndex))) return;

  //     const regexForMask = /\d+\.(.*)/; // Busca un número seguido de un punto y captura todo lo que está después
  //     const matchMask = mask.match(regexForMask); // Encuentra coincidencias
  //     const maskReplaces = matchMask ? matchMask[1].trim() : null;

  //     if (maskReplaces === null) return;

  //     const selectedId = newProduct.ids?.[Number(idIndex)];

  //     if (selectedId === undefined) return;

  //     const idToArray = Array.from(selectedId);
  //     const maskedSku = Array.from(maskReplaces).reduce((acc, letter) => {
  //       if (letter === "#") {
  //         const idLetter = idToArray.shift();
  //         acc += idLetter;
  //       } else acc += letter;

  //       return acc;
  //     }, "");

  //     trySku(maskedSku);
  //   }
  // }

  useEffect(() => {
    if (
      newProduct.ids.length !== 0 &&
      newProduct.sku !== "" &&
      newProduct.sku in contabiliumIndexedProductsBySku &&
      newProduct.title !== "" &&
      fastAddMode
    )
      handleAddProduct();
  }, [newProduct.title]);

  useEffect(() => {
    const searchedProduct = searchProduct(newProduct);
    if ((newProduct.ids.length || newProduct.sku) && searchedProduct)
      handleAddProduct(searchedProduct);
  }, [newProduct]);

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
        ids: uniqueIds,
      }));

      if (hasDuplicates) {
        audios.tabToSkuAudio?.play();
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
            <span className="label-text">Impresion Remota</span>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="toggle"
              checked={remotePrint}
              onChange={(e) => setRemotePrint(e.target.checked)}
            />
            <input
              type="text"
              ref={idsFieldRef}
              className="input input-bordered grow"
              placeholder="ej: 192.168.0.1:3000"
              onChange={(e) => setRemotePrintHost(e.target.value)}
              value={remotePrintHost}
              disabled={!remotePrint}
            />
          </label>
        </label>

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
        {/* <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Mascara</span>
          </div>

          <input
            type="text"
            ref={idsFieldRef}
            className="input input-bordered"
            placeholder="ej: 1.### el 1. dice que debe ser el primer id, las almohadillas ponen los datos del id"
            onChange={(event) => setMask(event.target.value)}
            value={mask}
          />
        </label> */}
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
              // onFocus={handleFocusOnSku}
            />
            <div className="form-control  ">
              <label className="label cursor-pointer flex gap-1 border px-2 rounded shadow-xs">
                <span className="label-text">Modo Rapido</span>
                <input
                  type="checkbox"
                  checked={fastAddMode}
                  onChange={(e) => setFastAddMode(e.target.checked)}
                  className="checkbox checkbox-xs"
                />
              </label>
            </div>
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
          <button
            onClick={() => handleAddProduct()}
            className="btn  btn-neutral"
          >
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
