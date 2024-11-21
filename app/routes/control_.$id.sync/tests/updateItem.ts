import ContabiliumService from "~/services/Contabilium.service.server";

function updateItem() {
  const contabiliumService = new ContabiliumService();

  const { moveBetweenDeposits, originDepositId, destinyDepositId, control } =
    (await request.json()) as Target;

  const { products } = control;

  await contabiliumService.authenticate();

  const results: { error: string[]; success: string[] } = {
    error: [],
    success: [],
  };

  if (moveBetweenDeposits)
    products.forEach(async (product) => {
      await contabiliumService.modifyStockWithMovements(
        originDepositId,
        destinyDepositId,
        product.sku,
        product.quantity
      );
      results.success.push(product.sku);
    });
  else
    products.forEach(async (product) => {
      await contabiliumService.modifyStock(
        destinyDepositId,
        undefined,
        product.sku,
        product.quantity
      );
      results.success.push(product.sku);
    });

  return results;
}
