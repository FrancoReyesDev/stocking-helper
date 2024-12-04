import { useLoaderData } from "@remix-run/react";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import ControlsTable from "./components/ControlsTable.component";
import { ActionFunctionArgs } from "@remix-run/node";
import { v4 as uuidV4 } from "uuid";
import { Control } from "~/types/Control.type";
import CreateControlDialog from "./components/CreateControlDialog.component";
import { useState } from "react";

export async function action({ request }: ActionFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  switch (request.method) {
    case "POST": {
      const uuid = uuidV4();
      const control = await request.json();
      controlsRepository.saveControl({ ...control, uuid });
      return new Response(null, { status: 200 });
    }
    case "DELETE": {
      const uuid = ((await request.json()) as Control).uuid;
      controlsRepository.deleteControl(uuid);
      return new Response(null, { status: 200 });
    }
  }
}

export function loader() {
  const controlsRepository = new ControlsRepository();

  const controls = controlsRepository.controls;
  return controls;
}

export default function Index() {
  const [openCreateControl, setOpenCreateControl] = useState(false);
  const controls = useLoaderData<typeof loader>();

  return (
    <article>
      <header className="prose flex gap-2">
        <h2>Controles</h2>
      </header>
      <CreateControlDialog
        open={openCreateControl}
        setOpen={setOpenCreateControl}
      />
      <ControlsTable
        handleOpenCreateControlFrom={() => {
          setOpenCreateControl(true);
        }}
        controls={controls}
      />
    </article>
  );
}
