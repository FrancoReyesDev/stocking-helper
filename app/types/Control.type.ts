export interface Control {
  id: string;
  name: string;
  isoStringDate: string;
  details: string;
  products: {
    sku: string;
    name: string;
    quantity: number;
    details: string;
  }[];
}
