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
      keys: ["sku", "nombre"], // Campos a buscar
      threshold: 0.4, // Ajusta este valor según necesites (0 es coincidencia exacta, 1 es más permisivo)
      shouldSort: true, // Ordena los resultados por relevancia
      ignoreLocation: true, // Ignora la posición de las coincidencias en el string
      minMatchCharLength: 2, // Mínimo de caracteres para que una coincidencia sea válida
    });
    return fuse;
  }

  public searchProduct(str: string) {
    const results = this.fuse.search(str);
    return results.map((result) => result.item);
  }
}
