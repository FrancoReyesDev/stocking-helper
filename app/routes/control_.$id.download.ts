import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { ControlsRepository } from "~/repositories/Controls.repository";
import { WorkbookService } from "~/services/Workbook.service";
import XLSX from "xlsx";

export function loader({ params }: LoaderFunctionArgs) {
  console.log("me llamaron");
  const controlsRepository = new ControlsRepository();

  if (params?.id === undefined) return redirect("/");

  const control = controlsRepository.getControl(params.id as string);
  if (control === undefined) return redirect("/");

  const workbookService = new WorkbookService();

  const headers = ["sku", "nombre", "cantidad", "detalles"];
  const aoaFromControl = control.products.map(
    ({ sku, name, quantity, details }) => [sku, name, quantity, details]
  );

  const workbook = workbookService.createWorkbookFromAoA(control.name, [
    headers,
    ...aoaFromControl,
  ]);

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Devuelve la respuesta con el archivo
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        "attachment; filename=control - " + control.name + ".xlsx",
    },
  });
}
