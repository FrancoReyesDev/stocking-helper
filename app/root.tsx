import {
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";

import "./tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen min-w-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();

  const inRoot = location.pathname === "/";

  return (
    <div className="mx-auto lg:w-2/3 p-8">
      <header className="my-6 prose flex gap-4">
        <Link to={"/"}>{!inRoot && <span>&#8592;</span>} inicio</Link>
        {inRoot ? (
          <NavLink to={"/control/create"}>
            {({ isPending }) => (isPending ? "cargando..." : "nuevo control")}
          </NavLink>
        ) : null}
      </header>
      <Outlet />
    </div>
  );
}
