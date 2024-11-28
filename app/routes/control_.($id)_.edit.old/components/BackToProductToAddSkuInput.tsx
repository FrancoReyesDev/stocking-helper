import { MouseEvent, RefObject } from "react";
import { SearchIcon } from "~/components/icons/Search.icon";

interface Props {
  productToAddSkuRef: RefObject<HTMLInputElement>;
}

export function BackToProductToAddSkuInput({ productToAddSkuRef }: Props) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    productToAddSkuRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    productToAddSkuRef.current?.focus();
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
