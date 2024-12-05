import { Dispatch, SetStateAction } from "react";

interface Props {
  remotePrintHost: string;
  setRemotePrintHost: Dispatch<SetStateAction<string>>;
  remotePrint: boolean;
  setRemotePrint: Dispatch<SetStateAction<boolean>>;
}

export default function RemotePrinterConfig({
  remotePrint,
  remotePrintHost,
  setRemotePrint,
  setRemotePrintHost,
}: Props) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text">Impresion Remota</span>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="toggle"
          checked={remotePrint}
          onChange={(e) => setRemotePrint(e.target.checked)}
        />
        <input
          type="text"
          className="input input-bordered grow"
          placeholder="ej: 192.168.0.1:3000"
          onChange={(e) => setRemotePrintHost(e.target.value)}
          value={remotePrintHost}
          disabled={!remotePrint}
        />
      </label>
    </label>
  );
}
