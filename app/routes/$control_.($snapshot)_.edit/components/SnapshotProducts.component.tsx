import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import CbItem from "~/types/CbItem.type";
import { ControlSnapshotProduct } from "~/types/Control.type";
import _ from "lodash";
import useSnapshot from "../hooks/useSnapshot";
import printOnRemotePrinter from "~/lib/printOnRemotePrinter";
import RemotePrinterConfig from "./RemotePrinterConfig.component";

const defaultProduct: ControlSnapshotProduct = {
  uuid: "",
  sku: "",
  ids: [],
  title: "",
  details: "",
  additions: [],
};

type UseSnapshotReturn = ReturnType<typeof useSnapshot>;

function ProductRow() {}

interface Props {
  contabiliumIndexedProductsBySku: {
    [sku: string]: CbItem;
  };
  addProduct: UseSnapshotReturn["addProduct"];
  searchProduct: UseSnapshotReturn["searchProduct"];
}

export default function SnapshotProducts({
  contabiliumIndexedProductsBySku,
  searchProduct,
  addProduct,
}: Props) {
  const [newProduct, setNewProduct] =
    useState<ControlSnapshotProduct>(defaultProduct);
  const [additionQuantity, setAdditionQuantity] = useState("1");

  const idsFieldRef = useRef<HTMLInputElement>(null);
  const skuFieldRef = useRef<HTMLInputElement>(null);

  const [idsToString, setIdsToString] = useState(newProduct.ids.join(", "));
  const [fastAddMode, setFastAddMode] = useState(false);
  // const [mask, setMask] = useState("");

  const [remotePrint, setRemotePrint] = useState(false);
  const [remotePrintHost, setRemotePrintHost] = useState("");

  const [audios, setAudios] = useState<{
    addedProductAudio?: HTMLAudioElement;
    tabToSkuAudio?: HTMLAudioElement;
  }>({ addedProductAudio: undefined, tabToSkuAudio: undefined });

  useEffect(() => {
    const addedProductAudio = new Audio("/audios/addedProductNotification.mp3");
    addedProductAudio.load();
    const tabToSkuAudio = new Audio("/audios/skuFocusNotification.mp3");
    tabToSkuAudio.load();

    setAudios({ addedProductAudio, tabToSkuAudio });
  }, []);

  function playTabToSkuAudio() {
    audios.tabToSkuAudio?.load();
    audios.tabToSkuAudio?.play();
  }

  function playAddedProductAudio() {
    audios.addedProductAudio?.load();
    audios.addedProductAudio?.play();
  }

  function handleChangeProductIds(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setIdsToString(value);
  }

  function handlePressingEnterOnProductIds(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key !== "Enter") return;

    const ids = idsToString
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    if (ids.length === 0) return setIdsToString("");

    const uniqueIds = _.uniq(ids);
    const hasDuplicates = _.size(ids) !== _.size(uniqueIds);

    const newProductsWithUniqueIds = {
      ...newProduct,
      ids: uniqueIds,
    };

    const searchedProduct = searchProduct(newProductsWithUniqueIds);

    console.log({ searchedProduct, newProductsWithUniqueIds, uniqueIds, ids });

    if (searchedProduct) return handleAddProduct(searchedProduct);

    setNewProduct(newProductsWithUniqueIds);

    if (!hasDuplicates) return setIdsToString(ids.join(", ") + ", ");

    setIdsToString(uniqueIds.join(", "));
    skuFieldRef.current?.focus();
    playTabToSkuAudio();
  }

  function handleChangeProductField(field: keyof ControlSnapshotProduct) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue = event.target.value;

      setNewProduct((currentProduct) => ({
        ...currentProduct,
        [field]: newValue,
      }));
    };
  }

  function fillProductTitleIfSkuExistInContabilium(sku: string) {
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

  function handlePressingEnterOnProductSku(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key !== "Enter" || newProduct.sku === "") return;

    const searchedProduct = searchProduct(newProduct);
    if (searchedProduct) return handleAddProduct(searchedProduct);

    const sku = (event.target as HTMLInputElement).value.trim();
    fillProductTitleIfSkuExistInContabilium(sku);
  }

  function handleChangeAdditionQuantity(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;
    setAdditionQuantity(newValue);
  }

  function handleClearForm() {
    setNewProduct({ ...defaultProduct });
    setIdsToString("");
    setAdditionQuantity("1");
    idsFieldRef.current?.focus();
  }

  function handleAddProduct(product?: ControlSnapshotProduct) {
    const additionQuantityToNumber = Number(additionQuantity);

    if (isNaN(additionQuantityToNumber) || additionQuantityToNumber === 0)
      return;

    addProduct(product ?? newProduct, additionQuantityToNumber);

    if (remotePrint)
      printOnRemotePrinter({
        host: remotePrintHost,
        label: {
          sku: (product ?? newProduct).sku,
          title: (product ?? newProduct).title,
          quantity: additionQuantityToNumber,
        },
      });

    handleClearForm();
    playAddedProductAudio();
  }

  // Add product if all fields are not empty and product sku exist in Contabilium and fast mode is active
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

  return (
    <>
      <header className="prose mt-4">
        <h3>Agregar Producto</h3>
      </header>
      <div className="flex flex-col gap-1">
        <RemotePrinterConfig
          setRemotePrint={setRemotePrint}
          remotePrint={remotePrint}
          setRemotePrintHost={setRemotePrintHost}
          remotePrintHost={remotePrintHost}
        />

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Codigo</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              ref={idsFieldRef}
              className="grow"
              placeholder="Enter para agregar por codigo o sku (busca el primer codigo) si ya esta agregado"
              onChange={handleChangeProductIds}
              onKeyDown={handlePressingEnterOnProductIds}
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
              placeholder="Enter para agregar por sku si ya esta agregado o buscar en contabilium"
              onChange={handleChangeProductField("sku")}
              onKeyDown={handlePressingEnterOnProductSku}
              ref={skuFieldRef}
              value={newProduct.sku}
            />
            <div className="form-control">
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
            onChange={handleChangeAdditionQuantity}
            value={additionQuantity}
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

{
  /* <label className="form-control w-full">
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
        </label> */
}
