import { MouseEvent, RefObject } from "react";
import { SearchIcon } from "./icons/Search.icon";

interface Props {
  skuInputRef: RefObject<HTMLInputElement>;
}

export function BackToSkuInput({ skuInputRef }: Props) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    skuInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    skuInputRef.current?.focus();
  }

  return (
    <button
      onClick={handleClick}
      className="btn btn-circle btn-warning fixed bottom-4 right-4"
    >
      <SearchIcon />
    </button>
  );
}
