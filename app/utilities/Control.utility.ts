import {
  Control,
  ControlSnapshot,
  ControlSnapshotProduct,
  SnapshotProductAddition,
} from "~/types/Control.type";

export default class ControlUtility {
  control: Control;

  constructor(control: Control) {
    this.control = control;
  }

  get lastSnapshot() {
    return ControlUtility.getLastSnapshot(this.control.snapshots);
  }

  static getLastSnapshot(snapshots: Control["snapshots"]) {
    if (snapshots.length === 0) return undefined;

    return snapshots.reduce((acc, current, index) => {
      if (index === 0 || current.isoStringDate > acc.isoStringDate) {
        acc = current;
        return acc;
      }
      return acc;
    });
  }

  static getSortedSnapshots(snapshost: ControlSnapshot[]) {
    return snapshost.sort((a, b) =>
      a.isoStringDate >= b.isoStringDate ? 1 : -1
    );
  }

  static getSortedControlsByLastSnapshot(controls: Control[]) {
    return controls.sort((a, b) => {
      const aLastSnapshot = ControlUtility.getLastSnapshot(a.snapshots);
      const bLastSnapshot = ControlUtility.getLastSnapshot(b.snapshots);

      if (!aLastSnapshot || !bLastSnapshot) return 0;

      return aLastSnapshot >= bLastSnapshot ? 1 : -1;
    });
  }

  static getQuantityFromAddittions(additions: SnapshotProductAddition[]) {
    return additions.reduce((acc, { quantity }) => acc + Number(quantity), 0);
  }

  static getTotalQuantityFromProducts(products: ControlSnapshotProduct[]) {
    return products.reduce(
      (acc, current) =>
        acc + ControlUtility.getQuantityFromAddittions(current.additions),
      0
    );
  }
}
