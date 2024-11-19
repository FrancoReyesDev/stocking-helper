import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import { WorkbookUtility } from "~/utilities/Workbook.utility";
import XLSX from "xlsx";

export function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();

  if (params?.id === undefined) return redirect("/");

  const control = controlsRepository.getControl(params.id as string);
  if (control === undefined) return redirect("/");

  const workbookService = new WorkbookUtility();

  const headers = ["sku", "nombre", "cantidad", "detalles"];
  const aoaFromControl = control.products.map(
    ({ sku, name, quantity, details }) => [sku, name, quantity, details]
  );

  const workbook = workbookService.createWorkbookFromAoA("control", [
    headers,
    ...aoaFromControl,
  ]);

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "csv" });

  const sanitizedFileName = control.name
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  // Devuelve la respuesta con el archivo
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="control-' + sanitizedFileName + '.csv"',
    },
  });
}
