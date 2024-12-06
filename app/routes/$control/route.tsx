import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import ControlUtility from "~/utilities/Control.utility";
import ControlActions from "./components/ControlActions.component";
import SnapshotsActions from "./components/SnapshotsActions.component";
import { ActionFunctionArgs, redirectDocument } from "@remix-run/node";
import { v4 as uuidV4 } from "uuid";
import { Control as ControlType } from "~/types/Control.type";

export async function action({ request }: ActionFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const control = (await request.json()) as ControlType;

  const uuid = uuidV4();

  controlsRepository.saveControl({
    ...control,
    uuid,
  });

  return redirectDocument("/control/" + uuid);
}

export function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();
  const control = controlsRepository.getControl(params.control as string);
  return control === undefined ? redirect("/") : control;
}

export default function Control() {
  const control = useLoaderData<typeof loader>();

  const sortedSnapshots = ControlUtility.getSortedSnapshots(control.snapshots);
  return (
    <>
      <article>
        <header className="mb-2 prose">
          <h2>{control.name}</h2>
        </header>

        <div className="prose prose-p:first-letter:uppercase">
          <ControlActions />

          <h4>detalles</h4>
          <p>{control.details || "sin detalles"}</p>
        </div>

        <header className="prose mt-4">
          <h3>Snapshots</h3>
        </header>

        {control.snapshots.length === 0 ? (
          <p className="prose">
            Aun no tenes snapshots,{" "}
            <Link className="btn btn-link p-0" to={"./edit"}>
              crea una
            </Link>{" "}
            para comenzar...
          </p>
        ) : (
          <>
            <Link to={"./edit"} className="btn btn-xs btn-warning">
              crear
            </Link>
            <div className="overflow-auto">
              <table className="table table-pin-rows p-2 border  rounded mt-4">
                <thead>
                  <tr>
                    <th>fecha</th>
                    <th>productos</th>
                    <th>unidades totales</th>
                    <th>detalles</th>
                    <th>-</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSnapshots.map(
                    ({ uuid, isoStringDate, products, details }) => {
                      const formattedDate = new Date(
                        isoStringDate
                      ).toLocaleString("es-AR");

                      return (
                        <tr key={uuid}>
                          <td>{formattedDate}</td>
                          <td>{products.length}</td>
                          <td>
                            {ControlUtility.getTotalQuantityFromProducts(
                              products
                            )}
                          </td>
                          <td>{details}</td>
                          <td className="flex gap-1">
                            <Link
                              className="btn btn-xs btn-neutral"
                              to={`./${uuid}/edit`}
                            >
                              ver
                            </Link>
                            <Link
                              className="btn btn-xs btn-info"
                              reloadDocument
                              to={`./${uuid}/download?type=labels`}
                            >
                              exportar
                            </Link>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </article>
      <Outlet />
    </>
  );
}
