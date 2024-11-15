import { Link, useLoaderData } from "@remix-run/react";
import { ControlsPanel } from "~/components/ControlsPanel";
import { ControlsRepository } from "~/repositories/Controls.repository";

export function loader() {
  const controlsRepository = new ControlsRepository();
  const controls = controlsRepository.controls;
  return controls;
}

export default function Index() {
  const controls = useLoaderData<typeof loader>();

  return (
    <main className="grid gap-2 p-4">
      <Link to={"/control/create"} className="btn btn-block">
        nuevo control
      </Link>
      <ControlsPanel controls={controls} />
    </main>
  );
}
