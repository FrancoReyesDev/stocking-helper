import _ from "lodash";
import lunr from "lunr";

import Fuse from "fuse.js";
import CbItem from "~/types/CbItem.type";

export class ContabiliumService {
  private fuse: Fuse<CbItem>;
  // private lunrIndex: lunr.Index;
  arrayOfProducts: CbItem[];
  indexedProducts: { [sku: string]: CbItem };

  constructor(arrayOfProducts: CbItem[]) {
    this.arrayOfProducts = arrayOfProducts;
    this.indexedProducts = _.keyBy(this.arrayOfProducts, "sku");
    this.fuse = this.createFuse();
    // this.lunrIndex = this.createLunrIndex(arrayOfProducts);
  }

  private createLunrIndex(arrayOfProducts: CbItem[]) {
    const lunrIndex = lunr(function () {
      this.ref("sku");
      this.field("name");
      this.field("sku");

      arrayOfProducts.forEach((product) => this.add(product));
    });
    return lunrIndex;
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
