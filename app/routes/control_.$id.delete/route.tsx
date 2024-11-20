import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirectDocument,
} from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { ControlsRepository } from "~/repositories/Controls.repository.server";

export function action({ params }: ActionFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const controlId = params.id;

  //   if (controlId !== undefined) controlsRepository.deleteControl(controlId);

  return redirectDocument("/");
}

export function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const controlId = params.id;

  if (controlId === undefined) return redirectDocument("/");

  const control = controlsRepository.getControl(controlId);

  return control;
}

export default function DeleteControl() {
  const control = useLoaderData<typeof loader>();
  const navigate = useNavigate(); // Hook para navegación

  return (
    <div
      className="modal modal-open"
      onClick={() => navigate(-1)} // Cierra al hacer clic en el backdrop
    >
      <Form
        method="post"
        className="modal-box relative"
        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro del modal
      >
        <p>
          Para borrar "<strong>{control?.name}</strong>", escríbelo aquí abajo:
        </p>
        <input
          type="text"
          className="input input-sm input-bordered w-full mt-4"
          placeholder="Escribe el nombre"
          name="control-name"
        />
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-sm"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }} // Cierra el modal
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-sm btn-primary">
            Confirmar
          </button>
        </div>
      </Form>
    </div>
  );
}
