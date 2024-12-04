export interface SnapshotProductAddition {
  quantity: number;
  order: number;
}

export interface ControlSnapshotProduct {
  uuid: string;
  ids: string[];
  sku: string;
  title: string;
  additions: SnapshotProductAddition[];
  details: string;
}

export interface ControlSnapshot {
  uuid: string;
  isoStringDate: string;
  details: string;
  products: ControlSnapshotProduct[];
}

export interface Control {
  uuid: string;
  name: string;
  details: string;
  snapshots: ControlSnapshot[];
}
