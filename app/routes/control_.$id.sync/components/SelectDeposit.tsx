import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface Props {
  deposits: {
    Id: number;
    Nombre: string;
    Activo: boolean;
  }[];
  depositId: number;
  setDepositId: Dispatch<SetStateAction<number>>;
}
export default function SelectDeposit({
  deposits,
  depositId,
  setDepositId,
}: Props) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setDepositId(Number(event.target.value));
  }

  return (
    <select
      className="select select-sm select-bordered"
      value={depositId}
      onChange={handleChange}
    >
      {deposits.map(({ Nombre: name, Id: depositId }, index) => (
        <option value={depositId} key={index}>
          {name}
        </option>
      ))}
    </select>
  );
}
