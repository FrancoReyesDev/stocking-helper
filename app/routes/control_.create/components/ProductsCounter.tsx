import { Control } from "~/types/Control.type";

interface Props {
  products: Control["products"];
}

export function ProductsCounter({ products }: Props) {
  return (
    <p className="prose">
      productos: {products.length}, total:{" "}
      {products.reduce((acc, { quantity }) => {
        return acc + Number(quantity);
      }, 0)}
    </p>
  );
}
