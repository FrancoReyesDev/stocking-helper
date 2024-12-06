import { ControlSnapshotProduct } from "~/types/Control.type";

export default function getWorkbookParamsForContabilium(
  products: ControlSnapshotProduct[]
) {
  const headers = [
    "Nombre",
    "Codigo",
    "Descripcion",
    "Stock",
    "StockMinimo",
    "PrecioUnitario",
    "Observaciones",
    "Rentabilidad",
    "Iva",
    "CostoInterno",
    "CodigoProveedor",
    "Deposito",
    "CodigoBarra",
    "Rubro",
    "SubRubro",
    "Tipo",
    "PrecioAutomatico",
    "RG5329/2023",
  ] as const;
}
