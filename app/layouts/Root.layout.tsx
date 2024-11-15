interface Props {
  children: React.ReactNode;
}

export function RootLayout({ children }: Props) {
  return <div className="mx-auto lg:w-2/3 ">{children}</div>;
}
