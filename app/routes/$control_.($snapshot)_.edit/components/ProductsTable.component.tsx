import Fuse, { IFuseOptions } from "fuse.js";
import React, {
  ChangeEvent,
  Dispatch,
  Fragment,
  KeyboardEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ControlSnapshotProduct } from "~/types/Control.type";
import ControlUtility from "~/utilities/Control.utility";
import useSnapshot from "../hooks/useSnapshot";

type UseSnapshotReturn = ReturnType<typeof useSnapshot>;

interface Props {
  products: ControlSnapshotProduct[];
  setProductToEdit: Dispatch<
    SetStateAction<ControlSnapshotProduct | undefined>
  >;
  indexedByUuid: UseSnapshotReturn["indexedByUuid"];
}

export default function ProductsTable({
  products,
  setProductToEdit,
  indexedByUuid,
}: Props) {
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] =
    useState<ControlSnapshotProduct[]>(products);
  const [groupProducts, setGroupProducts] = useState(false);

  const fuse = useMemo(() => {
    const options: IFuseOptions<ControlSnapshotProduct> = {
      includeScore: false,
      keys: ["sku", "ids", "title"],
      threshold: 0,
      ignoreLocation: true,
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

  const totalUnits = ControlUtility.getTotalQuantityFromProducts(products);

  function handleSetProductToEdit(product: ControlSnapshotProduct) {
    return function () {
      setProductToEdit({ ...product });
    };
  }

  const productsByOrder = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const { additions } = product;

      if (additions.length === 0) {
        acc.push(product);
        return acc;
      }

      additions.forEach((addition) => {
        const newProduct: ControlSnapshotProduct = {
          ...product,
          additions: [addition],
        };
        acc.push(newProduct);
      });

      const sortedProducts = acc.sort((a, b) => {
        return a.additions[0].order >= b.additions[0].order ? 1 : -1;
      });

      return sortedProducts;
    }, [] as ControlSnapshotProduct[]);
  }, [groupProducts, filteredProducts]);

  const tableProducts = groupProducts ? filteredProducts : productsByOrder;

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
          {totalUnits === 0
            ? "sin unidades"
            : totalUnits === 1
            ? "unidad"
            : "unidades"}
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
              <th>
                <div className="form-control p-0">
                  <label className="p-0 label cursor-pointer flex justify-start gap-1.5 items-center">
                    <input
                      type="checkbox"
                      className="toggle toggle-xs"
                      checked={groupProducts}
                      onChange={(e) => setGroupProducts(e.target.checked)}
                    />
                    <span>{groupProducts ? "agrupado" : "en orden"}</span>
                  </label>
                </div>
              </th>
              <th>sku</th>
              <th>codigos</th>
              <th>titulo</th>
              <th>cantidad</th>
              <th>detalles</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tableProducts.map((product, index) => {
              const { sku, ids, title, additions, details } = product;
              return (
                <tr key={index}>
                  <td className="p-1.5">
                    {additions.map(({ order }) => order).join(", ")}
                  </td>
                  <td className="p-1.5">{sku}</td>
                  <td className="p-1.5">{ids.join(", ")}</td>
                  <td className="p-1.5">{title}</td>
                  <td className="p-1.5">
                    {ControlUtility.getQuantityFromAddittions(additions)}
                  </td>
                  <td className="p-1.5">{details || "-"}</td>
                  <td className="flex gap-1">
                    <button
                      className="btn btn-xs btn-neutral"
                      onClick={handleSetProductToEdit(
                        indexedByUuid[product.uuid]
                      )}
                    >
                      editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
