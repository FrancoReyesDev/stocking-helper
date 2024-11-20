import { Html5Qrcode } from "html5-qrcode";
import { useRef, useState } from "react";

export function useBarcodeScanner() {
  const [html5QrCode, setHtml5QrBarcode] = useState<Html5Qrcode | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  return {
    html5QrCode,
    cameraId,
    setCameraId,
    setOpenDialog,
    openDialog,
    setHtml5QrBarcode,
  };
}
