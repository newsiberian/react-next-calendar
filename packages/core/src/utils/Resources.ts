import * as React from 'react';

export const NONE = {};

type MapFn = (
  [id, resource]: [
    id: string | number | Record<string, undefined>,
    resource: Resource | null,
  ],
  index: number,
) => React.ReactNode[];

export default function Resources(
  resources: Resource[],
  accessors: Accessors,
): Resources {
  return {
    map(fn: MapFn) {
      if (!resources) return [fn([NONE, null], 0)];
      return resources.map((resource, idx) =>
        fn([accessors.resourceId(resource), resource], idx),
      );
    },

    groupEvents(
      events: RNC.Event[],
    ): Map<string | Record<string, undefined>, RNC.Event[]> {
      const eventsByResource = new Map<
        string | Record<string, undefined>,
        RNC.Event[]
      >();

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
