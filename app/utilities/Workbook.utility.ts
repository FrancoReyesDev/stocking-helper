import XLSX, { Sheet2JSONOpts } from "xlsx";

export class WorkbookUtility {
  static createWorkbook(filename: string) {
    const workbook = XLSX.readFile(filename);
    return workbook;
  }

  static sheetToAoJson<item = unknown>(
    workbook: XLSX.WorkBook,
    sheetName: string,
    headers: string[]
  ) {
    const opts: Sheet2JSONOpts = { header: headers, defval: null };
    const arrayOfJsons = XLSX.utils.sheet_to_json<item>(
      workbook.Sheets[sheetName],
      opts
    );
    return arrayOfJsons;
  }

  static createWorkbookFromAoA(title: string, data: any[][]) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    return workbook;
  }
}
