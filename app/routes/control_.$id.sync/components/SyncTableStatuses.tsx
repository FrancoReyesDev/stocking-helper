import { FetcherWithComponents } from "@remix-run/react";

interface Props {
  productFetchers: {
    [sku: string]: FetcherWithComponents<string>;
  };
}

export default function ProductSyncStatusesTable({ productFetchers }: Props) {
  return (
    <>
      <div className="overflow-x-auto">
        <header className="prose my-4">
          <h3>Cargando...</h3>
        </header>
        <table className="table table-xs">
          <thead>
            <tr>
              <th>sku</th>
              <th>nuevo stock</th>
              <th>mensaje</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(productFetchers).map(
              ([sku, { state, data, json }]) => (
                <tr key={sku}>
                  <td>{sku}</td>
                  <td>{JSON.stringify(json)}</td>
                  <td>{String(data)}</td>
                  <td>{state}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
