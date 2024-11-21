import { useNavigate } from "@remix-run/react";

interface Props {
  children: React.ReactNode;
  open: boolean;
}

export default function Modal({ children, open }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className={`modal ${open ? "modal-open" : ""}`}
      onClick={() => navigate(-1)} // Cierra al hacer clic en el backdrop
    >
      {children}
    </div>
  );
}
