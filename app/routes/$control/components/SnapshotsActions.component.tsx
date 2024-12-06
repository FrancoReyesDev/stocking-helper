import { NavLink, useFetcher } from "@remix-run/react";

export default function SnapshotsActions() {
  return (
    <div className="flex gap-1">
      <NavLink to={"./edit"} className="btn btn-xs btn-neutral">
        {({ isPending }) => (isPending ? "...cargando" : "editar")}
      </NavLink>
      <NavLink
        reloadDocument
        to={"./download"}
        className="btn btn-xs btn-warning"
      >
        {({ isPending }) => (isPending ? "...cargando" : "exportar")}
      </NavLink>
    </div>
  );
}
