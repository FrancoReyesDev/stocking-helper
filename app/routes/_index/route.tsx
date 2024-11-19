import { Link, useLoaderData } from "@remix-run/react";
import { ControlsRepository } from "~/repositories/Controls.repository.server";

export function loader() {
  const controlsRepository = new ControlsRepository();
  const controls = controlsRepository.controls;
  return controls;
}

export default function Index() {
  const controls = useLoaderData<typeof loader>();

  return (
    <article>
      <header className="prose mb-4">
        <h2>Controles</h2>
      </header>
      {!controls.length ? (
        "No hay controles, crea uno para comenzar..."
      ) : (
        <div className=" border rounded-md p-2">
          <table className="table table-pin-rows">
            <thead>
              <tr className="bg-base-200 rounded">
                <th></th>
                <th>nombre</th>
                <th>fecha</th>
                <th>articulos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {controls.map((control, index) => {
                const formattedDate = new Date(
                  control.isoStringDate
                ).toLocaleString();
                return (
                  <tr key={control.id}>
                    <td>{controls.length - index}</td>
                    <td>{control.name}</td>
                    <td>{formattedDate}</td>
                    <td>{control.products.length}</td>
                    <td>
                      <Link to={"/control/" + control.id}>ver</Link>{" "}
                      <Link
                        reloadDocument
                        to={"/control/" + control.id + "/download"}
                      >
                        exportar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
