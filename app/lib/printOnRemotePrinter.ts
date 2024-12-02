interface Args {
  host: string;
  label: { sku: string; title: string; quantity: number };
}

export default function printOnRemotePrinter({ host, label }: Args) {
  const url = `http://${host}/labels/remote/sse`;
  const response = fetch(url, {
    method: "POST",
    body: JSON.stringify([label]),
  });
}
