import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
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
  const navigate = useNavigate();
  const inRoot = location.pathname === "/";

  return (
    <div className="mx-auto lg:w-2/3 p-8">
      {!inRoot && (
        <header className="mb-4 mt-2 prose flex gap-4">
          <button
            className="btn btn-link p-0 text-black"
            onClick={() => navigate(-1)}
          >
            &#8592; atras
          </button>

          <Link className="btn btn-link p-0 text-black" to={"/"}>
            inicio
          </Link>
        </header>
      )}
      <Outlet />
    </div>
  );
}
