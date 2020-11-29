import * as React from 'react';

export interface HeaderProps {
  label: React.ReactNode;
}

export default function Header({ label }: HeaderProps): React.ReactElement {
  return <span>{label}</span>;
}
