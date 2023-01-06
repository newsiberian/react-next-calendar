import type { ReactNode } from 'react';

export interface ResourceHeaderProps {
  index: number;
  label: ReactNode;
  resource: Resource;
}

export default function ResourceHeader({ label }: ResourceHeaderProps) {
  return <>{label}</>;
}
