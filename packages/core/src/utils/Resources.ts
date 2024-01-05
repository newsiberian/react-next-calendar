import type { ReactNode } from 'react';

export const NONE = 'nothing-here';

type MapCallback = (
  [id, resource]: [id: string | number, resource: Resource | null],
  index: number,
) => ReactNode[] | ReactNode;

export function Resources(resources: Resource[]) {
  return {
    map(callback: MapCallback) {
      return !resources
        ? [callback([NONE, null], 0)]
        : resources.map((resource, idx) =>
            callback([resource.id, resource], idx),
          );
    },

    groupEvents(events: RNC.Event[]): Map<string | number, RNC.Event[]> {
      const eventsByResource = new Map<string | number, RNC.Event[]>();

      if (!resources) {
        // Return all events if resources are not provided
        eventsByResource.set(NONE, events);
        return eventsByResource;
      }

      events.forEach(event => {
        const id = event.resourceId ?? NONE;
        const resourceEvents = eventsByResource.get(id) || [];
        resourceEvents.push(event);
        eventsByResource.set(id, resourceEvents);
      });
      return eventsByResource;
    },
  };
}
