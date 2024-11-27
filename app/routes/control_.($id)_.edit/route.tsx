import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, redirectDocument, useLoaderData } from "@remix-run/react";
import {
  ChangeEvent,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ContabiliumRepository } from "~/repositories/Contabilium.repository.server";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import { ContabiliumProductsUtility } from "~/utilities/ContabiliumProducts.utility";
import CbItem from "~/types/CbItem.type";
import { Control } from "~/types/Control.type";
import { AddProductControl } from "./components/AddProductControl";
import { ProductsCounter } from "./components/ProductsCounter";
import { AddProductSuggestions } from "./components/AddProductSuggestions";
import { AddedProducts } from "./components/AddedProducts";
import _ from "lodash";
// function verifyControl(control: Control) {}

export async function action({ request }: ActionFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const body = await request.formData();
  const formData = Object.fromEntries(body.entries());

  const date = new Date();

  const newControl: Control = {
    id: crypto.randomUUID(),
    name: formData["control-name"] as string,
    details: formData["control-details"] as string,
    isoStringDate: date.toISOString(),
    products: [],
  };

  let index = 0;
  while (`product-sku-${index}` in formData) {
    const product = {
      sku: (formData[`product-sku-${index}`] as string) || "",
      name: (formData[`product-name-${index}`] as string) || "",
      quantity: Number(formData[`product-quantity-${index}`]) || 0,
      details: (formData[`product-details-${index}`] as string) || "",
    };
    newControl.products.push(product);
    index++;
  }

  controlsRepository.saveControl(newControl);

  return redirectDocument("/control/" + newControl.id);
}

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

const defaultControl: Control = {
  id: "",
  name: "",
  details: "",
  isoStringDate: "",
  products: [],
};

export default function ControlCreate() {
  const { arrayOfProducts, currentControl } = useLoaderData<typeof loader>();
  const contabiliumProductsUtility = new ContabiliumProductsUtility(
    arrayOfProducts
  );

  const [control, setControl] = useState<Control>(
    currentControl !== null ? currentControl : defaultControl
  );

  const [productToAddSku, setProductToAddSku] = useState("");
  const [productToAddQuantity, setProductToAddQuantity] = useState(1);
  const [searchProductResults, setSearchProductResults] = useState<CbItem[]>(
    []
  );
  const [onlySearchMode, setOnlySearchMode] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [tmpProducts, setTpmProducts] = useState<Control["products"]>([]);

  useEffect(() => {
    if (reviewMode) {
      setTpmProducts(control.products);
      const newProducts = control.products.map((product) => ({
        ...product,
        quantity: 0,
      }));
      setControl(({ products, ...rest }) => ({
        ...rest,
        products: newProducts,
      }));
    } else {
      const indexedProducts = _.keyBy(control.products, "sku");
      const newProducts = tmpProducts.forEach((product) => {
        if (product.sku in indexedProducts) {
          const reviewedProduct = indexedProducts[product.sku];

          if (reviewedProduct.quantity === null)
            reviewedProduct.quantity = product.quantity;
        }
      });
      setControl(({ products, ...rest }) => ({
        ...rest,
        products: Object.values(indexedProducts),
      }));
      setTpmProducts([]);
    }
  }, [reviewMode]);

  const productRefs = {};

  function clearProductToAddFields() {
    setProductToAddSku("");
    setProductToAddQuantity(1);
    setSearchProductResults([]);
  }

  function getHandleChangeControlField(field: keyof typeof control) {
    return function handleChange(
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue = event.target.value ?? "";
      setControl({ ...control, [field]: newValue });
    };
  }

  function addProduct(sku: string) {
    const listedProduct = control.products.find(
      (product) => product.sku.trim() === sku.trim()
    );

    if (listedProduct !== undefined) {
      clearProductToAddFields();
      return setControl(({ products, ...rest }) => {
        const newProducts = products.filter(
          (product) => product.sku.trim() !== sku.trim()
        );
        const newProduct: Control["products"][number] = {
          ...listedProduct,
          quantity:
            Number(listedProduct.quantity) + (productToAddQuantity ?? 1),
        };

        return { ...rest, products: [...newProducts, newProduct] };
      });
    }

    if (sku.trim() in contabiliumProductsUtility.indexedProducts) {
      clearProductToAddFields();
      return setControl(({ products, ...rest }) => {
        const cbItem = contabiliumProductsUtility.indexedProducts[sku.trim()];
        return {
          ...rest,
          products: [
            ...products,
            {
              sku: sku.trim(),
              name: cbItem.nombre,
              quantity: productToAddQuantity ?? 1,
              details: "",
            },
          ],
        };
      });
    }

    if (reviewMode) return clearProductToAddFields();

    const newProduct: Control["products"][number] = {
      sku: productToAddSku.trim(),
      name: "",
      quantity: productToAddQuantity ?? 1,
      details: "creado nuevo",
    };

    setControl(({ products, ...rest }) => ({
      ...rest,
      products: [...products, newProduct],
    }));

    clearProductToAddFields();
  }

  const handleKeyDown = (event: any) => {
    3;
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <article className="grid gap-2">
      <header className="prose mb-4">
        <h2>{currentControl === null ? "Nuevo" : "Editar"} Control</h2>
      </header>
      <Form
        method="post"
        className="flex flex-col gap-2"
        onKeyDown={handleKeyDown}
      >
        <input
          type="text"
          name="control-name"
          className="input input-bordered"
          placeholder="nombre"
          onChange={getHandleChangeControlField("name")}
          value={control.name}
          maxLength={30}
        />

        <textarea
          className="textarea textarea-bordered"
          placeholder="detalles"
          name="control-details"
          onChange={getHandleChangeControlField("details")}
          value={control.details}
          maxLength={500}
        />

        <div className="form-control max-w-content">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              checked={reviewMode}
              onChange={(event) => setReviewMode(event.target.checked)}
              className="checkbox"
            />
            <span className="label-text">Modo repaso</span>
          </label>
        </div>

        <AddProductControl
          productRefs={productRefs}
          onlySearchMode={onlySearchMode}
          setOnlySearchMode={setOnlySearchMode}
          productToAddSku={productToAddSku}
          setProductToAddSku={setProductToAddSku}
          productToAddQuantity={productToAddQuantity}
          setProductToAddQuantity={setProductToAddQuantity}
          searchProductResults={searchProductResults}
          setSearchProductResults={setSearchProductResults}
          contabiliumProductsUtility={contabiliumProductsUtility}
          addProduct={addProduct}
          clearProductToAddFields={clearProductToAddFields}
        />

        <ProductsCounter products={control.products} />

        <AddProductSuggestions
          addProduct={addProduct}
          searchProductResults={searchProductResults}
        />

        <AddedProducts
          productRefs={productRefs}
          setControl={setControl}
          products={control.products}
        />
        <button className="btn btn-block" type="submit">
          aceptar control
        </button>
      </Form>
    </article>
  );
}
