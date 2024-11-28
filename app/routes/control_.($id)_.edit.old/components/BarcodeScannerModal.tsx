import { Html5Qrcode } from "html5-qrcode";
import {
  Dispatch,
  MouseEvent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

interface Props {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  setHtml5QrBarcode: Dispatch<SetStateAction<Html5Qrcode | null>>;
  html5QrCode: Html5Qrcode | null;
}
function BarcodeScannerModal({
  setHtml5QrBarcode,
  openDialog,
  setOpenDialog,
  html5QrCode,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function handleCloseDialog(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOpenDialog(false);
  }

  function startHtmlQrCode() {
    html5QrCode?.start(
      { facingMode: "user" },
      { fps: 20, qrbox: { width: 500, height: 1000 } },
      (success) => {
        console.log(success);
      },
      (error) => {}
    );
  }

  useEffect(() => {
    setHtml5QrBarcode(new Html5Qrcode("reader"));
  }, [html5QrCode]);

  useEffect(() => {
    if (openDialog) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [openDialog]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box">
        <div id="reader" className="border rounded"></div>
        <div>
          <button onClick={startHtmlQrCode}>start</button>
        </div>
      </div>

      <div className="modal-backdrop">
        <button onClick={handleCloseDialog}>close</button>
      </div>
    </dialog>
  );
}

export default BarcodeScannerModal;
