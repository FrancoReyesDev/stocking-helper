import { useMemo, useState } from "react";
import _ from "lodash";
import {
  Control,
  ControlSnapshot,
  ControlSnapshotProduct,
  SnapshotProductAddition,
} from "~/types/Control.type";
import { v4 as uuidV4 } from "uuid";
import CommonUtility from "~/utilities/Common.utility";

const defaultSnapshot: ControlSnapshot = {
  uuid: "",
  details: "",
  isoStringDate: "",
  products: [],
};

interface Props {
  currentSnapshot: ControlSnapshot | null;
}

export default function useSnapshot(
  { currentSnapshot }: Props = { currentSnapshot: null }
) {
  const [snapshot, setSnapshot] = useState<ControlSnapshot>(
    currentSnapshot || defaultSnapshot
  );

  const [order, setOrder] = useState(1);

  function setSnapshotDetails(details: string) {
    setSnapshot(({ details: oldDetails, ...currentControl }) => ({
      ...currentControl,
      details,
    }));
  }

  const { mapProductByIdsHash, mapProductBySku, indexedByUuid } =
    useMemo(() => {
      const indexedByUuid = _.keyBy(snapshot.products, "uuid");

      const mapProductBySku = snapshot.products.reduce((acc, product) => {
        acc.set(String(product.sku).trim(), product);
        return acc;
      }, new Map() as Map<string, ControlSnapshotProduct>);

      const mapProductByIdsHash = snapshot.products.reduce((acc, product) => {
        const trimmedIds = product.ids.map((id) => id.trim());
        const idsPermutations = CommonUtility.getArrayPermutations(trimmedIds);

        idsPermutations.forEach((hash) => {
          acc.set(hash.join("-"), product);
        });

        return acc;
      }, new Map() as Map<string, ControlSnapshotProduct>);

      return { mapProductByIdsHash, mapProductBySku, indexedByUuid };
    }, [snapshot.products]);

  function removeProduct(productId: string) {
    setSnapshot(({ products: currentProducts, ...currentControl }) => ({
      ...currentControl,
      products: currentProducts.filter(({ uuid }) => uuid !== productId),
    }));
  }

  function searchProduct(
    product: ControlSnapshotProduct
  ): ControlSnapshotProduct | undefined {
    const productBySku = mapProductBySku.get(product.sku.trim());

    if (productBySku !== undefined) return productBySku;

    const trimmedIds = product.ids.map((id) => id.trim());
    const idsHash = trimmedIds.join("-");
    const productIdByidsHash = mapProductByIdsHash.get(idsHash);

    if (productIdByidsHash !== undefined) return productIdByidsHash;

    const firstProductId = trimmedIds?.[0] as string | undefined;
    const productSkuByFirstId =
      firstProductId !== undefined
        ? mapProductBySku.get(firstProductId)
        : undefined;

    return productSkuByFirstId;
  }

  function updateProduct(product: ControlSnapshotProduct) {
    const trimmedProduct = CommonUtility.getTrimmedObjectFields(product);

    const newProducts = {
      ...indexedByUuid,
      [product.uuid]: {
        ...trimmedProduct,
      },
    } as typeof indexedByUuid;

    setSnapshot((currentControl) => ({
      ...currentControl,
      products: Object.values(newProducts),
    }));
  }

  function updateProductAddition(
    product: ControlSnapshotProduct,
    order: number,
    newQuantity: number
  ) {
    const newAdditions: ControlSnapshotProduct["additions"] =
      product.additions.map((addition) => {
        return (
          order === addition.order
            ? { ...addition, quantity: newQuantity }
            : addition
        ) as SnapshotProductAddition;
      });

    const newProduct: ControlSnapshotProduct = {
      ...product,
      additions: newAdditions,
    };

    updateProduct(newProduct);
  }

  function removeProductAddition(
    product: ControlSnapshotProduct,
    order: number
  ) {
    const newAdditions: ControlSnapshotProduct["additions"] =
      product.additions.filter((addition) => addition.order !== order);

    const newProduct: ControlSnapshotProduct = {
      ...product,
      additions: newAdditions,
    };

    updateProduct(newProduct);
  }

  function addProductAddition(
    product: ControlSnapshotProduct,
    quantity: number
  ) {
    const newAdditions: ControlSnapshotProduct["additions"] = [
      ...product.additions,
      { order, quantity },
    ];
    const newProduct: ControlSnapshotProduct = {
      ...product,
      additions: newAdditions,
    };

    updateProduct(newProduct);
  }

  function addProduct(
    product: ControlSnapshotProduct,
    additionQuantity: number
  ) {
    const trimmedProduct = CommonUtility.getTrimmedObjectFields(product);

    const searchedProduct = searchProduct(trimmedProduct);

    if (searchedProduct === undefined) {
      const uuid = uuidV4();

      setSnapshot(({ products: currentProducts, ...currentControl }) => ({
        ...currentControl,
        products: [
          ...currentProducts,
          {
            ...trimmedProduct,
            uuid,
            additions: [{ order, quantity: additionQuantity }],
          },
        ],
      }));
    } else {
      const trimmedSearchedProduct =
        CommonUtility.getTrimmedObjectFields(searchedProduct);

      addProductAddition(trimmedSearchedProduct, additionQuantity);
    }

    setOrder((order) => order + 1);
  }

  return {
    searchProduct,
    addProduct,
    updateProductAddition,
    addProductAddition,
    snapshot,
    updateProduct,
    removeProduct,
    setSnapshotDetails,
    indexedByUuid,
    mapProductByIdsHash,
    mapProductBySku,
    removeProductAddition,
  };
}
