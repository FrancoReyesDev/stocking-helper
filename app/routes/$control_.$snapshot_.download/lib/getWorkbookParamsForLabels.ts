import { ControlSnapshotProduct } from "~/types/Control.type";
import ControlUtility from "~/utilities/Control.utility";

export default function getWorkbookParamsForLabels(
  products: ControlSnapshotProduct[]
) {
  const headers: string[] = ["sku", "nombre", "cantidad", "detalles"];

  const productsByOrder = ControlUtility.getProductsByOrder(products);

  const aoa = productsByOrder.map(({ sku, title, additions, details }) => [
    sku,
    title,
    ControlUtility.getQuantityFromAddittions(additions),
    details,
  ]);

  return { aoa, headers, filename: "labels" };
}
