import { Link } from "@remix-run/react";

interface Props {
  children: React.ReactNode;
}

export function RootLayout({ children }: Props) {
  return (
    <div className="mx-auto lg:w-2/3 ">
      <Link to={"/"}>inicio</Link>
      {children}
    </div>
  );
}
