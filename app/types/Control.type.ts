export interface ControlProduct {
  uuid: string;
  ids: string[];
  sku: string;
  title: string;
  quantity: number;
  details: string;
}

export interface Control {
  id: string;
  name: string;
  isoStringDate: string;
  details: string;
  products: ControlProduct[];
}
