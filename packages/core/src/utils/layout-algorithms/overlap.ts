class Event {
  public start: number;
  public end: number;
  public startMs: number;
  public endMs: number;
  public top: number;
  public height: number;

  public container?: Event;
  public row?: Event;
  public rows?: Event[];
  public leaves?: Event[];
  public data: RNC.Event;

  public constructor(
    data: RNC.Event,
    {
      accessors,
      slotMetrics,
    }: {
      accessors: Accessors;
      slotMetrics: TimeSlotMetrics<TimeSlotMetricsOptions>;
    },
  ) {
    const {
      start,
      startDate,
      end,
      endDate,
      top,
      height,
    } = slotMetrics.getRange(accessors.start(data), accessors.end(data));

    this.start = start;
    this.end = end;
    this.startMs = +startDate;
    this.endMs = +endDate;
    this.top = top;
    this.height = height;
    this.data = data;
  }

  /**
   * The event's width without any overlap.
   */
  get _width(): number {
    // The container event's width is determined by the maximum number of
    // events in any of its rows.
    if (this.rows) {
      const columns =
        this.rows.reduce(
          (max, row) => Math.max(max, (row.leaves as Event[]).length + 1), // add itself
          0,
        ) + 1; // add the container

      return 100 / columns;
    }

    const availableWidth = 100 - (this.container as Event)._width;

    // The row event's width is the space left by the container, divided
    // among itself and its leaves.
    if (this.leaves) {
      return availableWidth / (this.leaves.length + 1);
    }

    // The leaf event's width is determined by its row's width
    return (this.row as Event)._width;
  }

  /**
   * The event's calculated width, possibly with extra width added for
   * overlapping effect.
   */
  get width(): number {
    const noOverlap = this._width;
    const overlap = Math.min(100, this._width * 1.7);

    // Containers can always grow.
    if (this.rows) {
      return overlap;
    }

    // Rows can grow if they have leaves.
    if (this.leaves) {
      return this.leaves.length > 0 ? overlap : noOverlap;
    }

    // Leaves can grow unless they're the last item in a row.
    const { leaves } = this.row as Event;
    const index = (leaves as Event[]).indexOf(this);
    return index === (leaves as Event[]).length - 1 ? noOverlap : overlap;
  }

  get xOffset(): number {
    // Containers have no offset.
    if (this.rows) {
      return 0;
    }

    // Rows always start where their container ends.
    if (this.leaves) {
      return (this.container as Event)._width;
    }

    // Leaves are spread out evenly on the space left by its row.
    const { leaves, xOffset, _width } = this.row as Event;
    const index = (leaves as Event[]).indexOf(this) + 1;
    return xOffset + index * _width;
  }
}

/**
 * Return true if event a and b is considered to be on the same row.
 *
 * @param {Event} a
 * @param {Event} b
 * @param {number} minimumStartDifference
 */
function onSameRow(
  a: Event,
  b: Event,
  minimumStartDifference: number,
): boolean {
  return (
    // Occupies the same start slot.
    Math.abs(b.start - a.start) < minimumStartDifference ||
    // A's start slot overlaps with b's end slot.
    (b.start > a.start && b.start < a.end)
  );
}

/**
 * Performs comparing of two items by specified properties
 *
 * @thanks https://stackoverflow.com/a/56194061/7252759
 *
 * @param {string[]} props for sorting ['name'], ['value', 'city'], ['-date']
 * to set descending order on object property just add '-' at the beginning of
 * property
 */
const compareBy = <T extends keyof R | string, R>(...props: T[]) => (
  a: R,
  b: R,
) => {
  for (let i = 0; i < props.length; i++) {
    const ascValue = (props[i] as string).startsWith('-') ? -1 : 1;
    const prop = (props[i] as string).startsWith('-')
      ? (props[i] as string).substr(1)
      : props[i];
    if (a[prop as keyof R] !== b[prop as keyof R]) {
      return a[prop as keyof R] > b[prop as keyof R] ? ascValue : -ascValue;
    }
  }
  return 0;
};

function sortByRender(events: Event[]) {
  if (!events.length) {
    return [];
  }

  const sortedByTime = events.concat().sort(compareBy('startMs', '-endMs'));
  const sorted = [];

  while (sortedByTime.length > 0) {
    const event = sortedByTime.shift() as Event;
    sorted.push(event);

    for (let i = 0; i < sortedByTime.length; i++) {
      const test = sortedByTime[i];

      // Still inside this event, look for next.
      if (event.endMs > test.startMs) {
        continue;
      }

      // We've found the first event of the next event group.
      // If that event is not right next to our current event, we have to
      // move it here.
      if (i > 0) {
        const event = sortedByTime.splice(i, 1)[0];
        sorted.push(event);
      }

      // We've already found the next event group, so stop looking.
      break;
    }
  }

  return sorted;
}

export default function getStyledEvents({
  events,
  minimumStartDifference,
  slotMetrics,
  accessors,
}: GetStyledEventsOptions): StyledEvent[] {
  if (!events.length) {
    return [];
  }

  // Create proxy events and order them so that we don't have
  // to fiddle with z-indexes.
  const proxies = events.map(
    event => new Event(event, { slotMetrics, accessors }),
  );
  const eventsInRenderOrder = sortByRender(proxies);
  // Group overlapping events, while keeping order.
  // Every event is always one of: container, row or leaf.
  // Containers can contain rows, and rows can contain leaves.
  const containerEvents: Event[] = [];

  for (let i = 0; i < eventsInRenderOrder.length; i++) {
    const event = eventsInRenderOrder[i];

    // Check if this event can go into a container event.
    const container = containerEvents.find(
      c =>
        c.end > event.start ||
        Math.abs(event.start - c.start) < minimumStartDifference,
    );

    // Couldn't find a container — that means this event is a container.
    if (!container) {
      event.rows = [];
      containerEvents.push(event);
      continue;
    }

    // Found a container for the event.
    event.container = container;

    // Check if the event can be placed in an existing row.
    // Start looking from behind.
    let row = null;

    if (Array.isArray(container.rows) && container.rows.length) {
      for (let j = container.rows.length - 1; !row && j >= 0; j--) {
        if (onSameRow(container.rows[j], event, minimumStartDifference)) {
          row = container.rows[j];
        }
      }
    }

    if (row?.leaves) {
      // Found a row, so add it.
      row.leaves.push(event);
      event.row = row;
    } else {
      // Couldn't find a row – that means this event is a row.
      event.leaves = [];
      (container.rows as Event[]).push(event);
    }
  }

  // Return the original events, along with their styles.
  return eventsInRenderOrder.map(event => ({
    event: event.data,
    style: {
      top: event.top,
      height: event.height,
      width: event.width,
      xOffset: Math.max(0, event.xOffset),
    },
  }));
}
