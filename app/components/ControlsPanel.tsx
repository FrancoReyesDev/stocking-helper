import { Link } from "@remix-run/react";
import { Control } from "~/types/Control.type";

interface Props {
  controls: Control[];
}

export function ControlsPanel({ controls }: Props) {
  return (
    <article className="card shadow border ">
      <div className="card-body">
        {!controls.length ? (
          "No hay controles, crea uno para comenzar..."
        ) : (
          <table className="table table-pin-rows">
            <thead>
              <tr>
                <th></th>
                <th>nombre</th>
                <th>fecha</th>
                <th>articulos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {controls.map((control, index) => (
                <tr key={control.id}>
                  <td>{index}</td>
                  <td>{control.name}</td>
                  <td>{control.isoStringDate}</td>
                  <td>{control.products.length}</td>
                  <td>
                    <Link to={"/control/" + control.id}>ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </article>
  );
}
