import { ActionFunctionArgs } from "@remix-run/node";
import ContabiliumService from "~/services/Contabilium.service.server";
import { Control } from "~/types/Control.type";

interface Target {
  moveBetweenDeposits: boolean;
  originDepositId: number;
  destinyDepositId: number;
  product: Control["products"][number];
}

export async function action({ request }: ActionFunctionArgs) {
  const contabiliumService = new ContabiliumService();

  const { moveBetweenDeposits, originDepositId, destinyDepositId, product } =
    (await request.json()) as Target;

  await contabiliumService.authenticate();

  if (moveBetweenDeposits) {
    return await contabiliumService.modifyStockWithMovements(
      originDepositId,
      destinyDepositId,
      product.sku,
      product.quantity
    );
  }

  return await contabiliumService.modifyStock(
    destinyDepositId,
    undefined,
    product.sku,
    product.quantity
  );
}
