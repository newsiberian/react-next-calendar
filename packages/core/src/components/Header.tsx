import * as React from 'react';

export interface HeaderProps {
  date: Date;
  label: React.ReactNode;
  localizer: Localizer;
}

export default function Header({ label }: HeaderProps) {
  return <span>{label}</span>;
}
