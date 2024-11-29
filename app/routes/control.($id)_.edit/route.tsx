import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ContabiliumRepository } from "~/repositories/Contabilium.repository.server";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import { ContabiliumProductsUtility } from "~/utilities/ContabiliumProducts.utility";
import ControlFields from "./components/ControlFields.component";
import ControlProducts from "./components/ControlProducts.component";
import ProductsTable from "./components/ProductsTable.component";
import useControl from "./hooks/useControl";

export function loader({ params }: LoaderFunctionArgs) {
  const contabiliumRepository = new ContabiliumRepository();

  const currentControlId = params.id;

  const response = {
    arrayOfProducts: contabiliumRepository.arrayOfProducts,
    currentControl: null,
  };

  if (currentControlId === undefined) return response;

  const controlsRepository = new ControlsRepository();
  const currentControl = controlsRepository.getControl(currentControlId);

  return currentControl !== undefined
    ? { ...response, currentControl }
    : response;
}

export default function Edit() {
  const { arrayOfProducts, currentControl } = useLoaderData<typeof loader>();
  const contabiliumProductsUtility = new ContabiliumProductsUtility(
    arrayOfProducts
  );
  const { indexedProducts } = contabiliumProductsUtility;
  const {
    addProduct,
    searchProduct,
    control,
    updateProduct,
    removeProduct,
    setControlDetails,
    setControlName,
    productOrder,
  } = useControl({ currentControl });

  const products = control.products;

  return (
    <article className="grid gap-4">
      <header className="prose mb-4">
        <h2>{currentControl === null ? "Nuevo" : "Editar"} Control</h2>
      </header>
      <ControlFields
        setControlDetails={setControlDetails}
        setControlName={setControlName}
        control={control}
      />
      <ControlProducts
        addProduct={addProduct}
        searchProduct={searchProduct}
        contabiliumIndexedProductsBySku={indexedProducts}
      />
      {products.length > 0 && (
        <ProductsTable
          removeProduct={removeProduct}
          updateProduct={updateProduct}
          products={products}
          productOrder={productOrder}
        />
      )}
    </article>
  );
}
