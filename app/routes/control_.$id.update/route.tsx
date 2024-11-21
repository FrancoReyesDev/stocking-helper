import { LoaderFunctionArgs } from "@remix-run/node";
import { ControlsRepository } from "~/repositories/Controls.repository.server";
import ContabiliumService from "~/services/Contabilium.service.server";

export async function loader({}: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();
  const contabiliumService = new ContabiliumService();

  const product = controlsRepository.controls[0].products[0];

  await contabiliumService.authenticate();
  console.log({ product });
  console.log(await contabiliumService.getProductStock(product.sku));

  return null;
}
