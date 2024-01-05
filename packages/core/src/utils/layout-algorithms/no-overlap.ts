import overlap from './overlap';

function getMaxIdxDFS(
  styledEvent: StyledEvent,
  maxIdx: number,
  visited: StyledEvent[],
): number {
  for (let i = 0; i < (styledEvent.friends as StyledEvent[]).length; ++i) {
    if (visited.indexOf((styledEvent.friends as StyledEvent[])[i]) > -1) {
      continue;
    }
    maxIdx =
      maxIdx > ((styledEvent.friends as StyledEvent[])[i].idx as number)
        ? maxIdx
        : ((styledEvent.friends as StyledEvent[])[i].idx as number);
    // TODO : trace it by not object but kinda index or something for performance
    visited.push((styledEvent.friends as StyledEvent[])[i]);
    const newIdx = getMaxIdxDFS(
      (styledEvent.friends as StyledEvent[])[i],
      maxIdx,
      visited,
    );
    maxIdx = maxIdx > newIdx ? maxIdx : newIdx;
  }
  return maxIdx;
}

export default function ({
  events,
  minimumStartDifference,
  slotMetrics,
}: GetStyledEventsOptions): StyledEvent[] {
  if (!events.length) {
    return [];
  }

  const styledEvents = overlap({
    events,
    minimumStartDifference,
    slotMetrics,
  });

  styledEvents.sort((a, b): 1 | -1 => {
    if (a.style.top !== b.style.top) {
      return a.style.top > b.style.top ? 1 : -1;
    }
    return (a.style.top as number) + (a.style.height as number) <
      (b.style.top as number) + (b.style.height as number)
      ? 1
      : -1;
  });

  const eventsSize = styledEvents.length;

  for (let i = 0; i < eventsSize; ++i) {
    styledEvents[i].friends = [];
    delete styledEvents[i].style.left;
    delete styledEvents[i].style.left;
    delete styledEvents[i].idx;
    delete styledEvents[i].size;
  }

  for (let i = 0, l = eventsSize - 1; i < l; ++i) {
    const se1 = styledEvents[i];
    const y1 = se1.style.top;
    const y2 = (se1.style.top as number) + (se1.style.height as number);

    for (let j = i + 1; j < eventsSize; ++j) {
      const se2 = styledEvents[j];
      const y3 = se2.style.top;
      const y4 = (se2.style.top as number) + (se2.style.height as number);

      // be friends when overlapped
      if ((y3 <= y1 && y1 < y4) || (y1 <= y3 && y3 < y2)) {
        // TODO : hashmap would be effective for performance
        (se1.friends as StyledEvent[]).push(se2);
        (se2.friends as StyledEvent[]).push(se1);
      }
    }
  }

  for (let i = 0; i < eventsSize; ++i) {
    const se = styledEvents[i];
    const bitmap = [];

    for (let j = 0; j < 100; ++j) {
      // 1 means available
      bitmap.push(1);
    }

    for (let j = 0, l = (se.friends as StyledEvent[]).length; j < l; ++j) {
      if (typeof (se.friends as StyledEvent[])[j].idx !== 'undefined') {
        // 0 means reserved
        bitmap[(se.friends as StyledEvent[])[j].idx as number] = 0;
      }
    }

    se.idx = bitmap.indexOf(1);
  }

  for (let i = 0; i < eventsSize; ++i) {
    let size = 0;

    if (styledEvents[i].size) continue;

    const allFriends: StyledEvent[] = [];
    const maxIdx = getMaxIdxDFS(styledEvents[i], 0, allFriends);
    size = 100 / (maxIdx + 1);
    styledEvents[i].size = size;

    for (let j = 0; j < allFriends.length; ++j) allFriends[j].size = size;
  }

  for (let i = 0; i < eventsSize; ++i) {
    const e = styledEvents[i];
    e.style.left = (e.idx as number) * (e.size as number);

    // stretch to maximum
    let maxIdx = 0;
    for (let j = 0, l = (e.friends as StyledEvent[]).length; j < l; ++j) {
      const { idx } = (e.friends as StyledEvent[])[j];
      maxIdx = (maxIdx > (idx as number) ? maxIdx : idx) as number;
    }

    if (maxIdx <= (e.idx as number)) {
      e.size = 100 - (e.idx as number) * (e.size as number);
    }

    // padding between events
    // for this feature, `width` is not percentage based unit anymore
    // it will be used with calc()
    const padding = e.idx === 0 ? 0 : 3;
    e.style.width = `calc(${e.size}% - ${padding}px)`;
    e.style.height = `calc(${(e.style.height as number).toFixed(2)}% - 2px)`;
    e.style.xOffset = `calc(${e.style.left}% + ${padding}px)`;
  }

  return styledEvents;
}
