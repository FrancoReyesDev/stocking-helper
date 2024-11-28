import { useNavigate } from "@remix-run/react";
import { useFetcher } from "react-router-dom";
import { Control } from "~/types/Control.type";
import _ from "lodash";
import { SubmitTarget } from "react-router-dom/dist/dom";
import { ChangeEvent, Dispatch } from "react";

interface Props {
  control: Control;
  setControlName(name: string): void;
  setControlDetails(details: string): void;
}

export default function ControlFields({
  control,
  setControlDetails,
  setControlName,
}: Props) {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  function handleCloseControl() {
    navigate("..");
  }

  function handleSaveControl() {
    fetcher.submit({ control } as unknown as SubmitTarget, {
      //Remix bug, the type is ok
      method: "POST",
      encType: "application/json",
      action: "/control/save",
    });
  }

  function handleChangeControlName(event: ChangeEvent<HTMLInputElement>) {
    setControlName(event.target.value);
  }

  function handleChangeControlDetails(event: ChangeEvent<HTMLTextAreaElement>) {
    setControlDetails(event.target.value);
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Nombre</span>
        </div>
        <input
          type="text"
          name="control-name"
          className="input input-bordered w-full"
          onChange={handleChangeControlName}
          value={control.name}
          maxLength={30}
        />
      </label>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Detalles</span>
        </div>
        <textarea
          className="textarea textarea-bordered"
          name="control-details"
          onChange={handleChangeControlDetails}
          value={control.details}
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
