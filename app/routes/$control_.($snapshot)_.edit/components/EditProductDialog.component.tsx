import {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ControlSnapshotProduct,
  SnapshotProductAddition,
} from "~/types/Control.type";
import useSnapshot from "../hooks/useSnapshot";

type UseSnapshotReturn = ReturnType<typeof useSnapshot>;

interface Props {
  productToEdit: ControlSnapshotProduct;
  setProductToEdit: Dispatch<
    SetStateAction<ControlSnapshotProduct | undefined>
  >;
  removeProduct: UseSnapshotReturn["removeProduct"];
  updateProduct: UseSnapshotReturn["updateProduct"];
  mapProductBySku: UseSnapshotReturn["mapProductBySku"];
  mapProductByIdsHash: UseSnapshotReturn["mapProductByIdsHash"];
}

export default function EditProductDialog({
  productToEdit,
  updateProduct,
  removeProduct,
  setProductToEdit,
  mapProductByIdsHash,
  mapProductBySku,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  const [newProduct, setNewProduct] =
    useState<ControlSnapshotProduct>(productToEdit);

  const [idsToString, setIdsToString] = useState(
    productToEdit ? productToEdit.ids.join(", ") : ""
  );

  function handleChangeProductField(field: keyof ControlSnapshotProduct) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue = event.target.value;

      setNewProduct((current) => ({
        ...current,
        [field]: newValue,
      }));
    };
  }

  function handleChangeProductIds(event: ChangeEvent<HTMLInputElement>) {
    const value = (event.target as HTMLInputElement).value;
    setIdsToString(value);
  }

  function handlePressingEnterOnId(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    const value = idsToString
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    if (value.length > 0) setIdsToString(value.join(", ") + ", ");
  }

  function handleRemoveProduct() {
    removeProduct(newProduct.uuid);
  }

  function handleRemoveAddition(order: number) {
    return function () {
      const newAdditions = newProduct.additions.filter(
        (addition) => addition.order !== order
      );
      setNewProduct((current) => ({ ...current, additions: newAdditions }));
    };
  }

  function updateAddition(order: number, newValue: number) {
    const newAdditions = newProduct.additions.map((addition) =>
      addition.order === order ? { order, quantity: newValue } : addition
    );

    setNewProduct((current) => ({ ...current, additions: newAdditions }));
  }

  function handleUpdateAddition(order: number) {
    return function (event: ChangeEvent<HTMLInputElement>) {
      const newValue = event.target.value;

      updateAddition(order, Number(newValue));
    };
  }

  const skuAlreadyExists =
    newProduct.sku !== productToEdit.sku && mapProductBySku.has(newProduct.sku);

  const idsAlreadyExists =
    newProduct.ids.join("-") !== productToEdit.ids.join("-") &&
    mapProductByIdsHash.has(newProduct.ids.join("-"));

  function handleSubmit() {
    if (
      skuAlreadyExists ||
      idsAlreadyExists ||
      newProduct.sku === "" ||
      newProduct.ids.length === 0 ||
      newProduct.title === ""
    )
      return;

    updateProduct(newProduct);
    setProductToEdit(undefined);
  }

  useEffect(() => {
    if (idsToString !== "" && newProduct !== undefined) {
      const ids = idsToString
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "");

      updateProduct({
        ...newProduct,
        ids,
      });
    }
  }, [idsToString]);

  return (
    <dialog className="modal modal-open" ref={ref}>
      <div className="modal-box">
        <header className="prose">
          <h3>Editar producto: {productToEdit.sku}</h3>
        </header>
        <div className="grid gap-2">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Sku</span>
              {skuAlreadyExists && (
                <span className="label-text-alt text-error">
                  Este sku ya existe
                </span>
              )}
              {newProduct.sku === "" && (
                <span className="label-text-alt text-error">
                  No puede estar vacio
                </span>
              )}
            </div>
            <input
              type="text"
              className={[
                "input",
                "input-bordered",
                skuAlreadyExists ? "input-error" : "",
              ].join(" ")}
              value={newProduct.sku || ""}
              onChange={handleChangeProductField("sku")}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text ">Ids</span>
              {idsAlreadyExists && (
                <span className="label-text-alt text-error">
                  Este conjunto de ids ya existe
                </span>
              )}
              {newProduct.ids.length === 0 && (
                <span className="label-text-alt text-error">
                  No puede estar vacio
                </span>
              )}
            </div>

            <input
              type="text"
              className={[
                "input",
                "input-bordered",
                idsAlreadyExists ? "input-error" : "",
              ].join(" ")}
              value={idsToString}
              onChange={handleChangeProductIds}
              onKeyDown={handlePressingEnterOnId}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Titulo</span>
              {newProduct.title === "" && (
                <span className="label-text-alt text-error">
                  No puede estar vacio
                </span>
              )}
            </div>

            <input
              type="text"
              className="input input-bordered "
              value={newProduct.title || ""}
              onChange={handleChangeProductField("title")}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Detalles</span>
            </div>
            <textarea
              className="textarea textarea-bordered "
              value={newProduct.details || ""}
              onChange={handleChangeProductField("details")}
            />
          </label>
        </div>

        <header className="prose mt-4">
          <h4>Adiciones</h4>
        </header>
        <table className="table">
          <thead>
            <tr>
              <th>orden</th>
              <th>cantidad</th>
              <td>-</td>
            </tr>
          </thead>
          <tbody>
            {newProduct.additions.map((addition, index) => (
              <tr key={addition.order}>
                <td>{addition.order}</td>
                <td>
                  <input
                    type="number"
                    className="input input-bordered input-xs"
                    min={0}
                    value={addition.quantity || ""}
                    onChange={handleUpdateAddition(addition.order)}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={handleRemoveAddition(addition.order)}
                  >
                    eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="modal-action gap-2">
          <button
            onClick={() => setProductToEdit(undefined)}
            className="btn btn-md"
          >
            cancelar
          </button>
          <button onClick={handleSubmit} className="btn btn-neutral btn-md">
            aceptar
          </button>
        </div>
      </div>
      <div className="modal-backdrop">
        <button
          onClick={() => {
            setProductToEdit(undefined);
          }}
        ></button>
      </div>
    </dialog>
  );
}
