import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirectDocument,
} from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import Modal from "~/components/Modal";
import { ControlsRepository } from "~/repositories/Controls.repository.server";

enum Errors {
  controlNameDoesNotMatch,
}

export async function action({ params, request }: ActionFunctionArgs) {
  const body = await request.formData();
  const formData = Object.fromEntries(body.entries());
  const confirmationControlName = formData["confirmation-control-name"];

  const controlsRepository = new ControlsRepository();
  const controlId = params.id as string;

  const currentControl = controlsRepository.getControl(controlId);

  if (currentControl === undefined) return redirectDocument("/");

  if (confirmationControlName === currentControl.name) {
    controlsRepository.deleteControl(controlId);
    return redirectDocument("/");
  } else return { error: Errors.controlNameDoesNotMatch };
}

export function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const controlId = params.id as string;

  const control = controlsRepository.getControl(controlId);

  if (control === undefined) return redirectDocument("/");

  return control;
}

export default function DeleteControl() {
  const control = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate(); // Hook para navegación

  return (
    <Modal open>
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
          className={
            "input input-sm input-bordered w-full mt-4 " +
            (actionData?.error ?? "")
          }
          placeholder="Escribe el nombre"
          name="confirmation-control-name"
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
          <button type="submit" className="btn btn-sm btn-error">
            Confirmar
          </button>
        </div>
      </Form>
    </Modal>
  );
}
