import { cbItemHeaders } from "~/constants/cbItemHeaders.constant";
import { WorkbookService } from "~/services/Workbook.service";
import CbItem from "~/types/CbItem.type";
import path from "path";

export class ContabiliumRepository {
  private filename = path.join(
    import.meta.dirname,
    "../../assets/contabilium-925.xlsx"
  );
  arrayOfProducts: CbItem[];

  constructor() {
    this.arrayOfProducts = this.getProductsFromAssets();
  }

  private getProductsFromAssets(): typeof this.arrayOfProducts {
    const workbookService = new WorkbookService();
    const workbook = workbookService.createWorkbook(this.filename);
    const arrayOfJsons = workbookService.sheetToAoJson<CbItem>(
      workbook,
      workbook.SheetNames[0],
      cbItemHeaders
    );
    return arrayOfJsons;
  }
}
