import { WorkbookUtility } from "~/utilities/Workbook.utility";
import XLSX from "xlsx";

interface Params {
  headers: string[];
  aoa: (string | number)[][];
  filename: string;
}

export default function createCsvResponseFromWorkbookParams({
  headers,
  aoa,
  filename,
}: Params) {
  const workbook = WorkbookUtility.createWorkbookFromAoA(filename, [
    headers,
    ...aoa,
  ]);

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "csv" });

  const sanitizedFileName = filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="control-' + sanitizedFileName + '.csv"',
    },
  });
}
