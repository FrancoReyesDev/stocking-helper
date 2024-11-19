import _ from "lodash";

import Fuse from "fuse.js";
import CbItem from "~/types/CbItem.type";

export class ContabiliumProductsUtility {
  private fuse: Fuse<CbItem>;
  arrayOfProducts: CbItem[];
  indexedProducts: { [sku: string]: CbItem };

  constructor(arrayOfProducts: CbItem[]) {
    this.arrayOfProducts = arrayOfProducts;
    this.indexedProducts = _.keyBy(this.arrayOfProducts, "sku");
    this.fuse = this.createFuse();
  }

  private createFuse() {
    const fuse = new Fuse(this.arrayOfProducts, {
      keys: ["sku", "nombre"],
      threshold: 0.2,
      shouldSort: true,
    });
    return fuse;
  }

  public searchProduct(str: string) {
    const results = this.fuse.search(str);
    return results.map((result) => result.item);
  }
}
