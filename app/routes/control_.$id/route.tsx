import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Modal } from "~/components/Modal";
import { ControlsRepository } from "~/repositories/Controls.repository.server";

export function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();
  const control = controlsRepository.getControl(params.id as string);
  return control === undefined ? redirect("/") : control;
}

export default function Control() {
  const control = useLoaderData<typeof loader>();
  const totalUnits = control.products.reduce((acc, current) => {
    return acc + Number(current.quantity);
  }, 0);

  return (
    <>
      <article>
        <header className="mb-2 prose">
          <h2>{control.name}</h2>
        </header>

        <div className="prose space-y-1 ">
          <p className="mb-0">
            fecha: {new Date(control.isoStringDate).toLocaleString()}
          </p>
          <p>productos: {control.products.length}</p>
          <p>unidades totales: {totalUnits}</p>
          <p>detalles: {control.details || "sin detalles"}</p>
          <div className="flex mt-2">
            <NavLink to={"./edit"} className="prose">
              {({ isPending }) => (isPending ? "cargando..." : "editar")}
            </NavLink>
            <NavLink to={"./delete"}>borrar</NavLink>
          </div>
        </div>

        <div className=" border rounded-md p-2 mt-4">
          <table className="table table-pin-rows">
            <thead>
              <tr className="bg-base-200 rounded">
                <th>sku</th>
                <th>nombre</th>
                <th>cantidad</th>
                <th>detalles</th>
              </tr>
            </thead>
            <tbody>
              {control.products.map(({ sku, quantity, name, details }) => (
                <tr key={sku}>
                  <td>{sku}</td>
                  <td>{name}</td>
                  <td>{quantity}</td>
                  <td>{details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <Outlet />
    </>
  );
}
