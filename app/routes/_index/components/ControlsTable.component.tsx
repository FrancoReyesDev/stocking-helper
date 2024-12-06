import { NavLink, useFetcher } from "@remix-run/react";
import { Control } from "~/types/Control.type";
import ControlUtility from "~/utilities/Control.utility";

interface Props {
  controls: Control[];
  handleOpenCreateControlFrom(): void;
}

export default function ControlsTable({
  controls,
  handleOpenCreateControlFrom,
}: Props) {
  const fetcher = useFetcher();
  const sortedControls =
    ControlUtility.getSortedControlsByLastSnapshot(controls);

  if (!controls.length)
    return (
      <p className="">
        No hay controles,{" "}
        <button
          className="btn btn-link p-0"
          onClick={handleOpenCreateControlFrom}
        >
          crea uno
        </button>{" "}
        para comenzar...
      </p>
    );

  function handleDelete(control: Control) {
    return function () {
      fetcher.submit(control as any, {
        method: "DELETE",
        encType: "application/json",
      });
    };
  }

  return (
    <div className="overflow-auto">
      <table className="table  table-pin-rows p-2 border  rounded mt-4">
        <thead>
          <tr>
            <th>-</th>
            <th>nombre</th>
            <th>ultimo control</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedControls.map((control, index) => {
            const lastSnapshot = ControlUtility.getLastSnapshot(
              control.snapshots
            );
            const formattedDate = lastSnapshot
              ? new Date(lastSnapshot.isoStringDate).toLocaleString()
              : "sin controles";
            return (
              <tr key={control.uuid}>
                <td>{controls.length - index}</td>
                <td>{control.name}</td>
                <td>{formattedDate}</td>
                <td className="flex gap-1">
                  <NavLink
                    className="btn btn-xs btn-neutral"
                    to={`./${control.uuid}`}
                  >
                    ver
                  </NavLink>{" "}
                  <button
                    className="btn btn-xs btn-error"
                    onClick={handleDelete(control)}
                  >
                    borrar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
