import { ControlsRepository } from "~/repositories/Controls.repository.server";
import ContabiliumService from "~/services/Contabilium.service.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirectDocument,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import Modal from "~/components/Modal";
import SelectDeposit from "./components/SelectDeposit";
import { ChangeEvent, useState } from "react";
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
    await contabiliumService.modifyStockWithMovements(
      originDepositId,
      destinyDepositId,
      product.sku,
      product.quantity
    );
  } else {
    await contabiliumService.modifyStock(
      destinyDepositId,
      undefined,
      product.sku,
      product.quantity
    );
  }

  return results;
}

export async function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();
  const controlId = params.id as string;
  const control = controlsRepository.getControl(controlId);
  if (control === undefined) return redirectDocument("/");

  const contabiliumService = new ContabiliumService();
  await contabiliumService.authenticate();

  const deposits = await contabiliumService.getDeposits();

  return { deposits, control };
}

export default function SyncControl() {
  const { control, deposits } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [moveBetweenDeposits, setMoveBetweenDeposits] = useState(false);
  const [originDepositId, setOriginDepositId] = useState(deposits[0].Id);
  const [destinyDepositId, setDestinyDepositId] = useState(deposits[0].Id);

  function handleChangeMoveBetweenDeposits(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setMoveBetweenDeposits(event.target.checked);
  }

  function handleSubmit() {
    const target = {
      moveBetweenDeposits,
      originDeposit: originDepositId,
      destinyDeposit: destinyDepositId,
      control,
    };

    fetcher.submit(target, { method: "POST", encType: "application/json" });
  }

  return (
    <Modal open>
      <div className="modal-box grid" onClick={(e) => e.stopPropagation()}>
        <header className="prose">
          <h3>Sincronizar Articulos</h3>
        </header>

        <div className="form-control">
          <label className="label cursor-pointer gap-2 justify-start">
            <input
              type="checkbox"
              checked={moveBetweenDeposits}
              value={moveBetweenDeposits ? "true" : "false"}
              onChange={handleChangeMoveBetweenDeposits}
              className="checkbox"
            />
            <span className="label-text">mover entre depositos</span>
          </label>
        </div>

        {moveBetweenDeposits && (
          <>
            <label className="form-control w-full ">
              <div className="label">
                <span className="label-text">deposito origen</span>
              </div>
              <SelectDeposit
                depositId={originDepositId}
                setDepositId={setOriginDepositId}
                deposits={deposits}
              />
            </label>
            <label className="form-control w-full ">
              <div className="label">
                <span className="label-text">deposito destino</span>
              </div>
              <SelectDeposit
                depositId={destinyDepositId}
                setDepositId={setDestinyDepositId}
                deposits={deposits}
              />
            </label>
            <p className="prose mt-2">
              Esto hara que los articulos que esten en el deposito origen se
              muevan al deposito destino, ademas de agregar el stock
              correspondiente.
            </p>
          </>
        )}

        <div className="modal-action gap-4">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            cancelar
          </button>
          <button type="submit" className="btn" onClick={handleSubmit}>
            aceptar
          </button>
        </div>
      </div>
    </Modal>
  );
}
