import { ActionFunctionArgs, redirectDocument } from "@remix-run/node";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import { Control } from "~/types/Control.type";
import { v4 as uuidV4 } from "uuid";

export async function action({ request }: ActionFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  const control = (await request.json()) as Control;

  const uuid = uuidV4();
  const date = new Date();

  controlsRepository.saveControl({
    ...control,
    id: uuid,
    isoStringDate: date.toISOString(),
  });

  return redirectDocument("/control/" + uuid);
}
