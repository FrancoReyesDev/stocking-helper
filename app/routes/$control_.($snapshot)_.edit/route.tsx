import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ContabiliumRepository } from "~/repositories/Contabilium.repository.server";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import { ContabiliumProductsUtility } from "~/utilities/ContabiliumProducts.utility";
import SnapshotFields from "./components/SnapshotFields.component";
import SnapshotProducts from "./components/SnapshotProducts.component";
import ProductsTable from "./components/ProductsTable.component";
import useSnapshot from "./hooks/useSnapshot";
import EditProductDialog from "./components/EditProductDialog.component";
import { useState } from "react";
import { ControlSnapshotProduct } from "~/types/Control.type";

export function loader({ params }: LoaderFunctionArgs) {
  const contabiliumRepository = new ContabiliumRepository();
  const controlsRepository = new ControlsRepository();

  const controlId = params.control as string;
  const control = controlsRepository.getControl(controlId);

  if (controlId === undefined || control === undefined) return redirect("/");

  const response = {
    arrayOfProducts: contabiliumRepository.arrayOfProducts,
    control,
    snapshot: null,
  };

  const snapshotId = params.snapshot;

  if (snapshotId === undefined) return response;

  const snapshot = control.snapshots.find(({ uuid }) => snapshotId === uuid);

  return snapshot ? { ...response, snapshot } : response;
}

export default function Edit() {
  const {
    arrayOfProducts,
    control: currentControl,
    snapshot: currentSnapshot,
  } = useLoaderData<typeof loader>();
  const contabiliumProductsUtility = new ContabiliumProductsUtility(
    arrayOfProducts
  );
  const { indexedProducts } = contabiliumProductsUtility;
  const {
    addProduct,
    searchProduct,
    snapshot,
    updateProduct,
    removeProduct,
    setSnapshotDetails,
    mapProductByIdsHash,
    mapProductBySku,
    indexedByUuid,
  } = useSnapshot({ currentSnapshot });

  const [productToEdit, setProductToEdit] = useState<
    ControlSnapshotProduct | undefined
  >(undefined);

  return (
    <article className="grid gap-4">
      <header className="prose">
        <h2>
          {currentControl.name}, {currentSnapshot === null ? "Nueva" : "Editar"}{" "}
          Snapshot
        </h2>
      </header>
      <SnapshotFields
        setSnapshotDetails={setSnapshotDetails}
        snapshot={snapshot}
      />
      <SnapshotProducts
        addProduct={addProduct}
        searchProduct={searchProduct}
        contabiliumIndexedProductsBySku={indexedProducts}
      />
      {snapshot.products.length > 0 && (
        <ProductsTable
          indexedByUuid={indexedByUuid}
          products={snapshot.products}
          setProductToEdit={setProductToEdit}
        />
      )}
      {productToEdit && (
        <EditProductDialog
          productToEdit={productToEdit}
          setProductToEdit={setProductToEdit}
          updateProduct={updateProduct}
          removeProduct={removeProduct}
          mapProductByIdsHash={mapProductByIdsHash}
          mapProductBySku={mapProductBySku}
        />
      )}
    </article>
  );
}
