import type { ReactNode } from 'react';

export interface HeaderProps {
  date: Date;
  label: ReactNode;
  localizer: Localizer;
}

export default function Header({ label }: HeaderProps) {
  return <span>{label}</span>;
}
