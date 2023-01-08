import type { ReactNode } from 'react';

export type ResourceHeaderProps = {
  index: number;
  label: ReactNode;
  resource: Resource;
};

export function ResourceHeader({ label }: ResourceHeaderProps) {
  return <>{label}</>;
}
