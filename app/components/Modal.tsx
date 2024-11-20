import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react";

interface Props {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
}

export function Modal({ openDialog, setOpenDialog, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    openDialog ? dialogRef.current?.showModal() : dialogRef.current?.close();
  }, [openDialog]);

  return (
    <dialog ref={dialogRef}>
      <div className="modal-body">{children}</div>
      <div className="">
        <button>close</button>
      </div>
    </dialog>
  );
}
