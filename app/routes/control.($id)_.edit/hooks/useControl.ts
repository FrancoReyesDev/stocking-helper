import { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { Control, ControlProduct } from "~/types/Control.type";
import { v4 as uuidV4 } from "uuid";

const defaultControl: Control = {
  id: "",
  name: "",
  details: "",
  isoStringDate: "",
  products: [],
};

interface Props {
  currentControl: Control | null;
}

export default function useControl(
  { currentControl }: Props = { currentControl: null }
) {
  const [control, setControl] = useState<Control>(
    currentControl || defaultControl
  );

  const products = control.products;

  function setControlName(name: string) {
    setControl(({ name: oldName, ...currentControl }) => ({
      ...currentControl,
      name,
    }));
  }

  function setControlDetails(details: string) {
    setControl(({ details: oldDetails, ...currentControl }) => ({
      ...currentControl,
      details,
    }));
  }

  const { mapProductById, mapProductBySku, indexedByUuid } = useMemo(() => {
    const indexedByUuid = _.keyBy(products, "uuid");
    const mapProductBySku = products.reduce((acc, product) => {
      acc.set(String(product.sku), product);
      return acc;
    }, new Map() as Map<string, ControlProduct>);
    const mapProductById = products.reduce((acc, product) => {
      product.ids.forEach((id) => {
        acc.set(String(id), product);
      });
      return acc;
    }, new Map() as Map<string, ControlProduct>);

    return { mapProductById, mapProductBySku, indexedByUuid };
  }, [products]);

  function removeProduct(productId: string) {
    setControl(({ products: currentProducts, ...currentControl }) => ({
      ...currentControl,
      products: currentProducts.filter(({ uuid }) => uuid !== productId),
    }));
  }

  function searchProduct(product: ControlProduct): ControlProduct | undefined {
    const productBySku = mapProductBySku.get(product.sku);

    if (productBySku !== undefined) return productBySku;

    const productIdByids = product.ids.find((id) => mapProductById.has(id));

    if (productIdByids !== undefined) return mapProductById.get(productIdByids);

    const productSkuByids = product.ids.find((id) => mapProductBySku.has(id));

    if (productSkuByids !== undefined)
      return mapProductBySku.get(productSkuByids);

    return undefined;
  }

  function updateProduct(product: ControlProduct) {
    const newProducts = {
      ...indexedByUuid,
      [product.uuid]: {
        ...product,
      },
    } as typeof indexedByUuid;
    setControl((currentControl) => ({
      ...currentControl,
      products: Object.values(newProducts),
    }));
  }

  function addProduct(product: ControlProduct) {
    const searchedProduct = searchProduct(product);

    if (searchedProduct === undefined) {
      const uuid = uuidV4();
      setControl(({ products: currentProducts, ...currentControl }) => ({
        ...currentControl,
        products: [...currentProducts, { ...product, uuid }],
      }));
    } else
      updateProduct({
        ...searchedProduct,
        quantity: searchedProduct.quantity + 1,
      });
  }

  return {
    searchProduct,
    addProduct,
    control,
    updateProduct,
    removeProduct,
    setControlName,
    setControlDetails,
  };
}
