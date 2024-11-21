import { ChangeEvent, Dispatch, SetStateAction } from "react";

interface Props {
  depositNames: string[];
  deposit: string;
  setDeposit: Dispatch<SetStateAction<string>>;
}
export default function SelectDeposit({
  depositNames,
  deposit,
  setDeposit,
}: Props) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setDeposit(event.target.value);
  }

  return (
    <select
      className="select select-sm select-bordered"
      value={deposit}
      onChange={handleChange}
    >
      {depositNames.map((name, index) => (
        <option key={index}>{name}</option>
      ))}
    </select>
  );
}
