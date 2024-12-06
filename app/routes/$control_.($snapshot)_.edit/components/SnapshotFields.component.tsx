import { useNavigate } from "@remix-run/react";
import { useFetcher } from "react-router-dom";
import { ControlSnapshot } from "~/types/Control.type";
import _ from "lodash";
import { SubmitTarget } from "react-router-dom/dist/dom";
import { ChangeEvent } from "react";
import { v4 as uuidV4 } from "uuid";

interface Props {
  controlUuid: string;
  snapshot: ControlSnapshot;
  setSnapshotDetails(details: string): void;
}

export default function SnapshotFields({
  snapshot,
  setSnapshotDetails,
  controlUuid,
}: Props) {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  function handleCloseControl() {
    navigate(-1);
  }

  function handleSaveControl() {
    const snapshotUuid = snapshot.uuid === "" ? uuidV4() : snapshot.uuid;
    const isoStringDate = new Date().toISOString();

    const newSnapshot: ControlSnapshot = {
      ...snapshot,
      uuid: snapshotUuid,
      isoStringDate,
    };

    fetcher.submit(newSnapshot as unknown as SubmitTarget, {
      method: "PUT",
      encType: "application/json",
      action: `/${controlUuid}/edit`,
    });

    handleCloseControl();
  }

  function handleChangeSnapshotDetails(
    event: ChangeEvent<HTMLTextAreaElement>
  ) {
    setSnapshotDetails(event.target.value);
  }

  return (
    <div className="flex flex-col gap-1">
      {snapshot.isoStringDate !== "" && <span>{snapshot.isoStringDate}</span>}

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Detalles</span>
        </div>
        <textarea
          className="textarea textarea-bordered"
          name="control-details"
          onChange={handleChangeSnapshotDetails}
          value={snapshot.details}
          maxLength={500}
        />
      </label>

      <div className="flex mt-2 gap-1">
        <button onClick={handleSaveControl} className="btn btn-neutral">
          Guardar
        </button>
        <button onClick={handleCloseControl} className="btn ">
          Cerrar
        </button>
      </div>
    </div>
  );
}
