import { cbItemHeaders } from "~/constants/cbItemHeaders.constant";
import { WorkbookUtility } from "~/utilities/Workbook.utility";
import CbItem from "~/types/CbItem.type";
import path from "path";

export class ContabiliumRepository {
  private contabiliumXlsxAssetFilename = path.join(
    import.meta.dirname,
    "../../assets/contabilium-925.xlsx"
  );
  arrayOfProducts: CbItem[];

  constructor() {
    this.arrayOfProducts = this.getArrayOfProductsFromContabiliumXlsx();
  }

  private getArrayOfProductsFromContabiliumXlsx(): typeof this.arrayOfProducts {
    const workbook = WorkbookUtility.createWorkbook(
      this.contabiliumXlsxAssetFilename
    );
    const arrayOfJsons = WorkbookUtility.sheetToAoJson<CbItem>(
      workbook,
      workbook.SheetNames[0],
      cbItemHeaders
    );
    return arrayOfJsons;
  }
}
