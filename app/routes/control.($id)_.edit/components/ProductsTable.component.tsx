import Fuse from "fuse.js";
import {
  ChangeEvent,
  Fragment,
  KeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ControlProduct } from "~/types/Control.type";

interface ProductTableRowFormProps {
  product: ControlProduct;
  updateProduct(product: ControlProduct): void;
  removeProduct(productId: string): void;
  order: number[];
}

function ProductTableRowForm({
  product,
  updateProduct,
  removeProduct,
  order,
}: ProductTableRowFormProps) {
  const { sku, title, ids, uuid, quantity, details } = product;

  const [idsToString, setIdsToString] = useState(ids.join(", "));

  function handleChangeProductField(field: keyof ControlProduct) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue =
        field === "quantity"
          ? Number(event.target.value) || ""
          : event.target.value;

      updateProduct({
        ...product,
        [field]: newValue,
      });
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

    setIdsToString(value.join(", ") + ", ");
  }

  function handleRemoveProduct() {
    removeProduct(uuid);
  }

  useEffect(() => {
    if (idsToString !== "") {
      const ids = idsToString
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "");

      updateProduct({
        ...product,
        ids,
      });
    }
  }, [idsToString]);

  return (
    <tr>
      <td className="p-1.5">
        <input
          type="text"
          className="input input-xs input-ghost "
          value={sku}
          onChange={handleChangeProductField("sku")}
        />
      </td>
      <td className="p-1.5">
        <input
          type="text"
          className="input input-xs input-ghost "
          value={idsToString}
          onChange={handleChangeProductIds}
          onKeyDown={handlePressingEnterOnId}
        />
      </td>
      <td className="p-1.5">
        <input
          type="text"
          className="input input-xs input-ghost "
          value={title}
          onChange={handleChangeProductField("title")}
        />
      </td>
      <td className="p-1.5">
        <input
          type="text"
          className="input input-xs input-ghost "
          value={quantity}
          onChange={handleChangeProductField("quantity")}
        />
      </td>
      <td className="p-1.5">
        <input
          type="text"
          className="input input-xs input-ghost "
          value={details}
          onChange={handleChangeProductField("details")}
        />
      </td>
      <td className="p-1.5">{(order ?? []).join(", ")}</td>
      <td>
        <button onClick={handleRemoveProduct} className="btn btn-xs">
          borrar
        </button>
      </td>
    </tr>
  );
}

interface Props {
  products: ControlProduct[];
  updateProduct(product: ControlProduct): void;
  removeProduct(productId: string): void;
  productOrder: { [uuid: string]: number[] };
}

export default function ProductsTable({
  products,
  updateProduct,
  removeProduct,
  productOrder,
}: Props) {
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] =
    useState<ControlProduct[]>(products);
  const fuse = useMemo(() => {
    const options = {
      includeScore: false,
      keys: ["sku", "ids", "title"],
    };

    const fuse = new Fuse(products, options);
    return fuse;
  }, [products]);

  function handleChangeSearchProduct(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setSearch(value);
  }

  useEffect(() => {
    if (search.trim() !== "") {
      const result = fuse.search(search);

      setFilteredProducts(result.map((item) => item.item));
    } else setFilteredProducts(products);
  }, [search, products]);

  const totalUnits = products.reduce((acc, { quantity }) => acc + quantity, 0);

  return (
    <>
      <header className="prose mt-4">
        <h3>Productos agregados</h3>
      </header>
      <div className="flex gap-2">
        <div className="badge badge-bordered p-3">
          {products.length === 0
            ? "sin products"
            : products.length === 1
            ? "1 producto"
            : products.length + " productos"}
        </div>
        <div className="badge badge-bordered p-3 ">
          {totalUnits === 0 ? "sin unidades" : totalUnits}{" "}
          {totalUnits === 1 ? "unidad" : "unidades"}
        </div>
      </div>

      <label className="form-control w-full w-max-xs">
        <div className="label">
          <span className="label-text">Buscar</span>
        </div>
        <input
          type="text"
          className="input input-bordered"
          placeholder="buscar por codigo, sku o titulo"
          onChange={handleChangeSearchProduct}
        />
      </label>

      <div className="overflow-auto">
        <table className="table table-pin-rows p-1">
          <thead>
            <tr>
              <th>sku</th>
              <th>codigos</th>
              <th>titulo</th>
              <th>cantidad</th>
              <th>detalles</th>
              <th>orden</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <Fragment key={product.uuid}>
                <ProductTableRowForm
                  removeProduct={removeProduct}
                  updateProduct={updateProduct}
                  product={product}
                  order={productOrder[product.uuid]}
                />
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
