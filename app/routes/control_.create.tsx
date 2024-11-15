import { Form, useLoaderData } from "@remix-run/react";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { ContabiliumRepository } from "~/repositories/Contabilium.repository";
import { ContabiliumService } from "~/services/Contabilium.service";
import CbItem from "~/types/CbItem.type";
import { Control } from "~/types/Control.type";

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
      const newValue = event.target.value ?? field === "quantity" ? 0 : "";
      const newProduct = {
        ...control.products.find((product) => product.sku === sku),
        [field]: newValue,
      } as Control["products"][number];
      setControl({
        ...control,
        products: [
          ...control.products.filter((product) => product.sku !== sku),
          newProduct,
        ],
      });
    };
  }

  function handleBarcodeChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value ?? "";
    setSearchProduct(newValue);

    if (newValue === "") setSearchProductResults([]);

    const searchResults = contabiliumService.searchProduct(newValue);
    setSearchProductResults(searchResults);
  }

  function handleBarcodeInput(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const target = event.target as HTMLInputElement;
      setSearchProduct(target.value);
      const sku = target.value;

      const listedProduct = control.products.find(
        (product) => product.sku === sku
      );

      if (listedProduct !== undefined)
        return setControl(({ products, ...rest }) => {
          const newProducts = products.filter((product) => product.sku !== sku);
          const newProduct: Control["products"][number] = {
            ...listedProduct,
            quantity: listedProduct.quantity + 1,
          };
          return { ...rest, products: [...newProducts, newProduct] };
        });

      const newProduct: Control["products"][number] = {
        sku,
        name: "",
        quantity: 1,
        details: "",
      };

      if (sku in contabiliumService.indexedProducts) {
        setSearchProduct("");
        setControl(({ products, ...rest }) => {
          const cbItem = contabiliumService.indexedProducts[sku];
          return {
            ...rest,
            products: [...products, { ...newProduct, name: cbItem.nombre }],
          };
        });
      }

      // No existe el producto
    }
  }

  return (
    <article className="grid gap-2 p-4 prose">
      <h2>Nuevo Control</h2>
      <Form method="POST" className="flex flex-col gap-2">
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
          className="input input-bordered"
          value={control.isoStringDate}
          disabled
        />
        <textarea
          className="textarea textarea-bordered"
          placeholder="detalles"
          name="control-details"
          onChange={getHandleChange("details")}
          value={control.details}
        />

        <label className="form-control w-full grow">
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

        {searchProductResults.slice(0, 10).map(({ sku, nombre }) => (
          <div key={sku} className="flex justify-between">
            <span>{sku}</span>
            <span>{nombre}</span>
            <button className="btn">agregar</button>
          </div>
        ))}

        {control.products.map((product, index) => (
          <>
            {index === 0 && <div className="divider"></div>}

            <div key={index} className="grid gap-2 bordered mt-2">
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
              <button className="btn btn-sm btn-block btn-error">
                eliminar
              </button>
            </div>
            {control.products.length > 0 &&
              index !== control.products.length - 1 && (
                <div className="divider"></div>
              )}
          </>
        ))}
      </Form>
    </article>
  );
}
