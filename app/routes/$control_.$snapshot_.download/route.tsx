import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import getWorkbookParamsForLabels from "./lib/getWorkbookParamsForLabels";
import createCsvResponseFromWorkbookParams from "./lib/createCsvResponseFromWorkbookParams";
import getWorkbookParamsForContabilium from "./lib/getWorkbookParamsForContabilium";

export function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const exportType = searchParams.get("type");

  const controlsRepository = new ControlsRepository();

  const controlUuid = params.control as string;
  const snapshotUuid = params.snapshot as string;

  const control = controlsRepository.getControl(controlUuid);

  if (control === undefined) return redirect("/");

  const snapshot = control.snapshots.find(
    (snapshot) => snapshot.uuid === snapshotUuid
  );

  if (snapshot === undefined) return redirect("/");

  if (exportType === null || exportType === "labels") {
    const workbookParams = getWorkbookParamsForLabels(snapshot.products);
    return createCsvResponseFromWorkbookParams(workbookParams);
  }

  if (exportType === "contabilium") {
    const workbookParams = getWorkbookParamsForContabilium(snapshot.products);
    return createCsvResponseFromWorkbookParams(workbookParams);
  }
}
