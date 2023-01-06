import clsx from 'clsx';

import { renderEvent, renderSpan, EventProps } from './EventRowMixin';

export interface EventRowProps extends EventProps {
  segments?: Segment[];
  /**
   * Currently used by `dnd` addon
   */
  className?: string;
}

function EventRow({ segments = [], className, ...props }: EventRowProps) {
  let lastEnd = 1;

  return (
    <div className={clsx(className, 'rbc-row')}>
      {segments.map(({ event, left, right, span }, index) => {
        const key = '_lvl_' + index;
        const gap = left - lastEnd;
        const row = [];

        const content = renderEvent(props, event);

        if (gap) {
          row.push(renderSpan(props.slotMetrics.slots, gap, `${key}_gap`));
        }

        row.push(renderSpan(props.slotMetrics.slots, span, key, content));

        lastEnd = right + 1;

        return row;
      })}
    </div>
  );
}

export default EventRow;
