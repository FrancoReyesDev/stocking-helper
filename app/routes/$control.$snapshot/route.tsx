import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import ControlUtility from "~/utilities/Control.utility";

export function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();
  const control = controlsRepository.getControl(params.control as string);

  if (control === undefined) return redirect("/");

  const snapshot = control?.snapshots.find(
    (snapshot) => snapshot.uuid === params.snapshot
  );

  return snapshot === undefined ? redirect("/") : { snapshot, control };
}

export default function Control() {
  const { snapshot, control } = useLoaderData<typeof loader>();
  const totalUnits = snapshot.products.reduce(
    (acc, current) =>
      acc + ControlUtility.getQuantityFromAddittions(current.additions),
    0
  );

  return (
    <>
      <article>
        <header className="mb-2 prose">
          <h2>{control?.name}</h2>
        </header>

        <div className="prose space-y-1 ">
          <p className="mb-0">
            fecha: {new Date(snapshot.isoStringDate).toLocaleString()}
          </p>
          <p>productos: {snapshot.products.length}</p>
          <p>unidades totales: {totalUnits}</p>
          <p>detalles: {snapshot.details || "sin detalles"}</p>
          <div className="flex mt-2 gap-2">
            <NavLink to={"./edit"} className="prose">
              {({ isPending }) => (isPending ? "cargando..." : "editar")}
            </NavLink>
            <NavLink to={"./delete"}>borrar</NavLink>
            <NavLink reloadDocument to={"./download"}>
              {({ isPending }) => (isPending ? "cargando..." : "exportar")}
            </NavLink>
            <NavLink to={"./sync"}>
              {({ isPending }) => (isPending ? "cargando..." : "sincronizar")}
            </NavLink>
          </div>
        </div>

        <div className=" border rounded-md p-2 mt-4">
          <table className="table table-pin-rows">
            <thead>
              <tr className="bg-base-200 rounded">
                <th>sku</th>
                <th>codigos</th>
                <th>nombre</th>
                <th>cantidad</th>
                <th>detalles</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.products.map(
                ({ sku, additions, title, ids, details }) => (
                  <tr key={sku}>
                    <td>{sku}</td>
                    <td>{ids?.join(", ") || ""}</td>
                    <td>{title}</td>
                    <td>
                      {ControlUtility.getQuantityFromAddittions(additions)}
                    </td>
                    <td>{details}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </article>
      <Outlet />
    </>
  );
}
