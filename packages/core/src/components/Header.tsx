import type { ReactNode } from 'react';

export type HeaderProps = {
  date: Date;
  label: ReactNode;
  localizer: Localizer;
};

export function Header({ label }: HeaderProps) {
  return <span>{label}</span>;
}
