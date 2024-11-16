import { ActionFunctionArgs } from "@remix-run/node";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import {
  ChangeEvent,
  Fragment,
  KeyboardEvent,
  MouseEvent,
  useState,
} from "react";
import { ContabiliumRepository } from "~/repositories/Contabilium.repository";
import { ControlsRepository } from "~/repositories/Controls.repository";
import { ContabiliumService } from "~/services/Contabilium.service";
import CbItem from "~/types/CbItem.type";
import { Control } from "~/types/Control.type";

export async function action({ request }: ActionFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const body = await request.formData();
  const formData = Object.fromEntries(body.entries());

  const newControl: Control = {
    id: crypto.randomUUID(),
    name: formData["control-name"] as string,
    details: formData["control-details"] as string,
    isoStringDate: formData["control-date"] as string,
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

  return redirect("/control/" + newControl.id);
}

export function loader() {
  const contabiliumRepository = new ContabiliumRepository();
  return contabiliumRepository.arrayOfProducts;
}

const defaultControl: Control = {
  id: "",
  name: "",
  details: "",
  isoStringDate: "",
  products: [],
};

export default function ControlCreate() {
  const arrayOfProducts = useLoaderData<typeof loader>();
  const contabiliumService = new ContabiliumService(arrayOfProducts);

  const [control, setControl] = useState<Control>({
    ...defaultControl,
    isoStringDate: new Date().toISOString(),
  });

  const [searchProduct, setSearchProduct] = useState("");
  const [searchProductResults, setSearchProductResults] = useState<CbItem[]>(
    []
  );

  function getHandleChange(field: keyof typeof control) {
    return function handleChange(
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue = event.target.value ?? "";
      setControl({ ...control, [field]: newValue });
    };
  }

  function getHandleChangeProduct(
    field: keyof (typeof control)["products"][number],
    sku: string
  ) {
    return function handleChangeProduct(
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue = event.target.value ?? (field === "quantity" ? 0 : "");

      const newProduct = {
        ...control.products.find((product) => product.sku === sku),
        [field]: newValue,
      } as Control["products"][number];
      setControl({
        ...control,
        products: control.products.map((product) =>
          product.sku !== sku ? product : newProduct
        ),
      });
    };
  }

  function getHandleDeleteProduct(sku: string) {
    return function (event: MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      setControl({
        ...control,
        products: control.products.filter((product) => product.sku !== sku),
      });
    };
  }

  function handleBarcodeChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value.trim() ?? "";
    setSearchProduct(newValue);

    if (newValue === "") setSearchProductResults([]);

    const searchResults = contabiliumService.searchProduct(newValue);
    setSearchProductResults(searchResults);
  }

  function handleBarcodeInput(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && searchProduct.trim() !== "") {
      const target = event.target as HTMLInputElement;
      const sku = target.value.trim();
      setSearchProduct(sku);

      addProduct(sku);
    }
  }

  function addProduct(sku: string) {
    const listedProduct = control.products.find(
      (product) => product.sku === sku
    );

    if (listedProduct !== undefined) {
      setSearchProduct("");
      setSearchProductResults([]);
      return setControl(({ products, ...rest }) => {
        const newProducts = products.filter((product) => product.sku !== sku);
        const newProduct: Control["products"][number] = {
          ...listedProduct,
          quantity: Number(listedProduct.quantity) + 1,
        };

        return { ...rest, products: [...newProducts, newProduct] };
      });
    }

    if (sku in contabiliumService.indexedProducts) {
      setSearchProduct("");
      setSearchProductResults([]);
      return setControl(({ products, ...rest }) => {
        const cbItem = contabiliumService.indexedProducts[sku];
        return {
          ...rest,
          products: [
            ...products,
            { sku, name: cbItem.nombre, quantity: 1, details: "" },
          ],
        };
      });
    }

    createNewProduct();
    setSearchProduct("");
    setSearchProductResults([]);
  }

  function createNewProduct() {
    const newProduct: Control["products"][number] = {
      sku: searchProduct,
      name: "",
      quantity: 1,
      details: "creado nuevo",
    };
    setSearchProduct("");
    setSearchProductResults([]);
    setControl(({ products, ...rest }) => ({
      ...rest,
      products: [...products, newProduct],
    }));
  }

  function getHandleAddItem(sku: string) {
    return function (event: MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
      addProduct(sku);
    };
  }

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <article className="grid gap-2 p-4 prose">
      <h2>Nuevo Control</h2>
      <Form
        method="POST"
        className="flex flex-col gap-2"
        onKeyDown={handleKeyDown}
      >
        <input
          type="text"
          name="control-name"
          className="input input-bordered"
          placeholder="nombre"
          onChange={getHandleChange("name")}
          value={control.name}
        />
        <input
          type="text"
          name="control-date"
          className="input input-bordered input-disabled"
          value={control.isoStringDate}
          readOnly
        />
        <textarea
          className="textarea textarea-bordered"
          placeholder="detalles"
          name="control-details"
          onChange={getHandleChange("details")}
          value={control.details}
        />

        <label className="form-control w-full grow ">
          <div className="label">
            <span className="label-text">Agregar Producto</span>
          </div>
          <input
            type="text"
            name="add-product"
            placeholder="sku"
            className="input input-bordered w-full"
            value={searchProduct}
            onChange={handleBarcodeChange}
            onKeyUp={handleBarcodeInput}
          />
        </label>

        {/* {searchProduct.length !== 0 && (
          <button
            onClick={createNewProduct}
            className="btn btn-sm btn-success btn-block"
          >
            crear nuevo producto
          </button>
        )} */}

        {searchProductResults.slice(0, 10).map(({ sku, nombre }) => (
          <div
            key={sku}
            className="flex justify-between border rounded p-2 items-center"
          >
            <div className="flex flex-col gap-1 ml-2">
              <span>
                <strong>sku:</strong> {sku}
              </span>
              <span>
                <strong>nombre:</strong> {nombre}
              </span>
            </div>
            <button className="btn" onClick={getHandleAddItem(sku)}>
              agregar
            </button>
          </div>
        ))}

        {control.products.map((product, index) => (
          <Fragment key={product.sku}>
            {index === 0 && <div className="divider"></div>}

            <div key={index} className="grid gap-2 bordered ">
              <input
                type="text"
                className="input input-bordered"
                name={"product-sku-" + index}
                placeholder="sku"
                value={product.sku}
                onChange={getHandleChangeProduct("sku", product.sku)}
              />
              <input
                type="text"
                placeholder="titulo"
                name={"product-name-" + index}
                className="input input-bordered"
                value={product.name}
                onChange={getHandleChangeProduct("name", product.sku)}
              />
              <input
                type="number"
                className="input input-bordered"
                placeholder="stock"
                name={"product-quantity-" + index}
                value={product.quantity}
                onChange={getHandleChangeProduct("quantity", product.sku)}
              />
              <textarea
                className="textarea textarea-bordered"
                name={"product-details-" + index}
                value={product.details}
                placeholder="detalles"
                onChange={getHandleChangeProduct("details", product.sku)}
              />
              <button
                onClick={getHandleDeleteProduct(product.sku)}
                className="btn btn-sm btn-block btn-error"
              >
                eliminar
              </button>
            </div>
            {control.products.length > 0 && <div className="divider"></div>}
          </Fragment>
        ))}
        <button className="btn btn-block" type="submit">
          aceptar control
        </button>
      </Form>
    </article>
  );
}
