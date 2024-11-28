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
}

function ProductTableRowForm({
  product,
  updateProduct,
  removeProduct,
}: ProductTableRowFormProps) {
  const { sku, title, ids, uuid, quantity, details } = product;

  const [idsToString, setIdsToString] = useState(ids.join(", "));

  function handleChangeProductField(field: keyof ControlProduct) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue =
        field === "quantity"
          ? Number(event.target.value) || 1
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
}

export default function ProductsTable({
  products,
  updateProduct,
  removeProduct,
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

  return (
    <>
      <header className="prose mt-4">
        <h3>Productos agregados</h3>
      </header>
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
                />
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
