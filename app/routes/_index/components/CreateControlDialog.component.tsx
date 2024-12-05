import { useFetcher } from "@remix-run/react";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Control } from "~/types/Control.type";
import { SubmitTarget } from "react-router-dom/dist/dom";

const defaultControl: Control = {
  uuid: "",
  name: "",
  details: "",
  snapshots: [],
};

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function CreateControlDialog({ open, setOpen }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const fetcher = useFetcher<Control>();
  const [newControl, setNewControl] = useState<Control>(defaultControl);

  function handleChangeNewControl(field: keyof Control) {
    return function (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
      const newValue = event.target.value;
      setNewControl((currentControl) => ({
        ...currentControl,
        [field]: newValue,
      }));
    };
  }

  function handleSubmit() {
    fetcher.submit(newControl as unknown as SubmitTarget, {
      encType: "application/json",
      method: "POST",
    });
    handleClose();
  }

  function handleClose() {
    setOpen(false);
  }

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box">
        <header className="prose mb-4 flex justify-start gap-2">
          <h3>Nuevo Control</h3>
        </header>
        <div className="grid gap-2 mb-4">
          <label className="form-control w-full ">
            <div className="label">
              <span className="label-text">Nombre</span>
            </div>
            <input
              value={newControl.name}
              onChange={handleChangeNewControl("name")}
              type="text"
              className="input input-bordered w-full "
            />
          </label>
          <label className="form-control w-full ">
            <div className="label">
              <span className="label-text">Detalles</span>
            </div>
            <textarea
              value={newControl.details}
              onChange={handleChangeNewControl("details")}
              className="textarea textarea-bordered w-full "
            />
          </label>

          <div className="modal-action">
            <button onClick={handleClose} className="btn btn-sm">
              Cerrar
            </button>
            <button onClick={handleSubmit} className="btn btn-success btn-sm">
              Aceptar
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </div>
    </dialog>
  );
}
