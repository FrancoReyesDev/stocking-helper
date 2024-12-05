import { NavLink } from "@remix-run/react";

export default function SnapshotsActions() {
  return (
    <div className="flex gap-1 ">
      <NavLink className="btn btn-xs btn-neutral" to={"./edit"}>
        editar
      </NavLink>
      <NavLink
        className="btn btn-xs btn-neutral"
        reloadDocument
        to={"./download"}
      >
        {({ isPending }) => (isPending ? "cargando..." : "exportar")}
      </NavLink>
    </div>
  );
}
