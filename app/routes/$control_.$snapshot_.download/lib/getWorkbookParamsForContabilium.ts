import { ControlSnapshotProduct } from "~/types/Control.type";
import ControlUtility from "~/utilities/Control.utility";

export default function getWorkbookParamsForContabilium(
  products: ControlSnapshotProduct[]
) {
  // const headers = [
  //   "Nombre",
  //   "Codigo",
  //   "Descripcion",
  //   "Stock",
  //   "StockMinimo",
  //   "PrecioUnitario",
  //   "Observaciones",
  //   "Rentabilidad",
  //   "Iva",
  //   "CostoInterno",
  //   "CodigoProveedor",
  //   "Deposito",
  //   "CodigoBarra",
  //   "Rubro",
  //   "SubRubro",
  //   "Tipo",
  //   "PrecioAutomatico",
  //   "RG5329/2023",
  // ] as const;
  const headers: string[] = ["sku", "nombre", "cantidad", "detalles"];

  const aoa = products.map(({ sku, title, additions, details }) => [
    sku,
    title,
    ControlUtility.getQuantityFromAddittions(additions),
    details,
  ]);

  return { aoa, headers, filename: "labels" };
}
