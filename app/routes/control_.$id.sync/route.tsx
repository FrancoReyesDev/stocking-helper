import { ControlsRepository } from "~/repositories/Controls.repository.server";
import ContabiliumService from "~/services/Contabilium.service.server";
import { LoaderFunctionArgs, redirectDocument } from "@remix-run/node";
import {
  FetcherWithComponents,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import Modal from "~/components/Modal";
import SelectDeposit from "./components/SelectDeposit";
import { ChangeEvent, useState } from "react";
import ProductSyncStatusesTable from "./components/SyncTableStatuses";

export async function loader({ params }: LoaderFunctionArgs) {
  const controlsRepository = new ControlsRepository();
  const controlId = params.id as string;
  const control = controlsRepository.getControl(controlId);
  if (control === undefined) return redirectDocument("/");

  const contabiliumService = new ContabiliumService();
  await contabiliumService.authenticate();

  const deposits = (await contabiliumService.getDeposits()).data;

  if (deposits === undefined)
    throw new Error("wtf donde estan los depositos xd");

  return { deposits, control };
}

export default function SyncControl() {
  const { control, deposits } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const productFetchers = control.products.reduce((acc, product) => {
    const sku = product.sku;
    acc[sku] = useFetcher();

    return acc;
  }, {} as { [sku: string]: FetcherWithComponents<string> });

  const [moveBetweenDeposits, setMoveBetweenDeposits] = useState(false);
  const [originDepositId, setOriginDepositId] = useState(deposits[0].Id);
  const [destinyDepositId, setDestinyDepositId] = useState(deposits[0].Id);

  function handleChangeMoveBetweenDeposits(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setMoveBetweenDeposits(event.target.checked);
  }

  function handleSubmit() {
    control.products.forEach((product) => {
      const fetcher = productFetchers[product.sku];

      if (fetcher === undefined) return;

      const target = {
        moveBetweenDeposits,
        originDepositId,
        destinyDepositId,
        product,
      };

      fetcher.submit(target, {
        method: "POST",
        encType: "application/json",
        action: "/api/sync-product",
      });
    });
  }

  return (
    <Modal open>
      <div className="modal-box grid" onClick={(e) => e.stopPropagation()}>
        <header className="prose">
          <h3>Sincronizar Articulos</h3>
          <p>Esta accion sincronizara {control.products.length} productos.</p>
        </header>

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

            <p className="prose mt-2">
              Esto hara que los articulos que esten en el deposito origen se
              muevan al deposito destino, ademas de agregar el stock
              correspondiente.
            </p>
          </>
        )}

        <ProductSyncStatusesTable productFetchers={productFetchers} />

        <div className="modal-action gap-4">
          <button className="btn btn-sm btn-ghost" onClick={() => navigate(-1)}>
            cancelar
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-warning"
            onClick={handleSubmit}
          >
            aceptar
          </button>
        </div>
      </div>
    </Modal>
  );
}
