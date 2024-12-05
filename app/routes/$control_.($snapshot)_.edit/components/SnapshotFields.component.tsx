import { useNavigate } from "@remix-run/react";
import { useFetcher } from "react-router-dom";
import { Control, ControlSnapshot } from "~/types/Control.type";
import _ from "lodash";
import { SubmitTarget } from "react-router-dom/dist/dom";
import { ChangeEvent, Dispatch } from "react";

interface Props {
  snapshot: ControlSnapshot;
  setSnapshotDetails(details: string): void;
}

export default function SnapshotFields({
  snapshot,
  setSnapshotDetails,
}: Props) {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  function handleCloseControl() {
    navigate("..");
  }

  function handleSaveControl() {
    fetcher.submit(snapshot as unknown as SubmitTarget, {
      //Remix bug, the type is ok
      method: "POST",
      encType: "application/json",
      action: "/control/save",
    });
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
