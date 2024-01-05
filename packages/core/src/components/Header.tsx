import type { ReactNode } from 'react';

export type HeaderProps = {
  date: Date;
  label: ReactNode;
};

export function Header({ label }: HeaderProps) {
  return <span>{label}</span>;
}
