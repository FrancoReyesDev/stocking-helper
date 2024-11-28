import { ActionFunctionArgs, redirectDocument } from "@remix-run/node";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import { Control } from "~/types/Control.type";

export async function action({ request }: ActionFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const control = (await request.json()) as Control;
  const date = new Date();

  const newControl: Control = {
    id: crypto.randomUUID(),
    name: control.name,
    details: control.details,
    isoStringDate: date.toISOString(),
    products: control.products,
  };

  controlsRepository.saveControl(newControl);

  return redirectDocument("/control/" + newControl.id);
}
