import { NavLink } from "@remix-run/react";

export default function SnapshotsActions() {
  return (
    <div className="flex gap-2 ">
      <NavLink to={"./edit"} className="prose">
        {({ isPending }) => (isPending ? "cargando..." : "crear")}
      </NavLink>
      <NavLink reloadDocument to={"./download"}>
        {({ isPending }) => (isPending ? "cargando..." : "exportar")}
      </NavLink>
    </div>
  );
}
