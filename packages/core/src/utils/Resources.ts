import * as React from 'react';

export const NONE = 'nothing-here';

type MapFn = (
  [id, resource]: [id: string | number, resource: Resource | null],
  index: number,
) => React.ReactNode[];

export default function Resources(
  resources: Resource[],
  accessors: Accessors,
): Resources {
  return {
    map(fn: MapFn) {
      return !resources
        ? [fn([NONE, null], 0)]
        : resources.map((resource, idx) =>
            fn([accessors.resourceId(resource), resource], idx),
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
        const id = accessors.resource(event) || NONE;
        const resourceEvents = eventsByResource.get(id) || [];
        resourceEvents.push(event);
        eventsByResource.set(id, resourceEvents);
      });
      return eventsByResource;
    },
  };
}
