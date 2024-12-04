import { NavLink } from "@remix-run/react";

export default function ControlActions() {
  return (
    <div className="flex gap-2 ">
      <button>editar</button>
      <NavLink to={"./delete"}>borrar</NavLink>
    </div>
  );
}
