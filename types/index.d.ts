import * as React from 'react';

import { NavigateAction } from '../packages/core/src/utils/constants';

declare global {
  namespace RNC {
    type Event = {
      id: number;
      /**
       * Used to display event information. Should resolve to a `renderable` value.
       */
      title: string;
      /**
       * The start date/time of the event.
       */
      start: Date;
      /**
       * The end date/time of the event.
       */
      end: Date;
      /**
       * Determines whether the event should be considered an "all day" event and
       * ignore time.
       */
      allDay?: boolean;
      /**
       * The id of the `resource` that the event is a member of. This id should
       * match at least one resource in the `resources` array.
       */
      resourceId?: string | number;
    };

    interface Selection {
      end: number;
      endDate: Date;
      height: string;
      start: number;
      startDate: Date;
      top: string;
    }
  }

  type ValueOf<T> = T[keyof T];

  interface ExtendedFC<P = Record<string, unknown>> extends React.FC<P> {
    range(
      date: Date,
      options?: { localizer?: Localizer; length?: number },
    ): Date[] | { start: Date; end: Date };

    navigate: (
      date: Date,
      action: NavigateAction,
      options: { length?: number },
    ) => Date;
    title: (
      date: Date,
      options: { localizer: Localizer; length?: number },
    ) => string;
  }

  type Unit = 'week' | 'day' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';

  type Action =
    | NavigateAction.NEXT
    | NavigateAction.PREVIOUS
    | NavigateAction.TODAY
    | NavigateAction.DATE;

  type ActionType =
    | 'selecting'
    | 'selectStart'
    | 'beforeSelect'
    | 'click'
    | 'doubleClick'
    | 'select'
    | 'reset'
    | 'dropFromOutside'
    | 'dragOverFromOutside';

  type DragAction = 'resize' | 'move';

  type DragDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

  type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

  type CustomViews = Record<View, boolean | ExtendedFC>;

  type CustomDayLayoutAlgorithm = (
    options: Exclude<GetStyledEventsOptions, 'dayLayoutAlgorithm'>,
  ) => StyledEvent[];

  /**
   * A day event layout(arrangement) algorithm.
   * `overlap` allows events to be overlapped.
   * `no-overlap` resizes events to avoid overlap.
   * or custom `Function(events, minimumStartDifference, slotMetrics, accessors)`
   */
  type DayLayoutAlgorithm = 'overlap' | 'no-overlap' | CustomDayLayoutAlgorithm;

  type Selectable = boolean | 'ignoreEvents';

  type Point = {
    clientX: number;
    clientY: number;
    x: number;
    y: number;
  };

  type NodeBounds = {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };

  type SelectedRect = {
    bottom: number;
    left: number;
    right: number;
    top: number;
    x: number;
    y: number;
  };

  type InitialSelection = {
    clientX: number;
    clientY: number;
    isTouch: boolean;
    x: number;
    y: number;
  };

  interface Slot {
    action: ActionType;
    start: number;
    end: number;
    bounds?: SelectedRect;
    box?: Point;
    resourceId?: ResourceId;
  }

  interface SlotInfo {
    action: ActionType;
    start: Date;
    end: Date;
    slots?: Date[];
    // for "select" action
    bounds?: SelectedRect;
    // for "click" or "doubleClick" actions
    box?: Point;
    resourceId?: ResourceId;
  }

  interface Resource {
    /**
     * A unique identifier for each resource in the `resources` array
     */
    id: string | number;
    /**
     * A human-readable name for the resource object, used in headers.
     */
    title: string;
  }

  interface Resources {
    map: (fn: MapFn) => React.ReactNode[];
    groupEvents: (events: RNC.Event[]) => Map<string | unknown, RNC.Event[]>;
  }

  type ResourceId = number | string | Record<string, undefined> | null;

  interface Segment {
    event: RNC.Event;
    span: number;
    left: number;
    right: number;
  }

  interface DateSlotMetricsOptions {
    events: RNC.Event[];
    range: Date[];
    maxRows: number;
    minRows: number;
  }

  interface DateSlotMetrics<
    DateSlotMetricsOptions = Record<string, undefined>,
  > {
    clone: (
      options: DateSlotMetricsOptions,
    ) => DateSlotMetrics<DateSlotMetricsOptions>;
    continuesAfter: (event: RNC.Event) => boolean;
    continuesPrior: (event: RNC.Event) => boolean;
    extra: Segment[];
    first: Date;
    getDateForSlot: (slotNumber: number) => Date;
    getEventsForSlot: (slot: number) => RNC.Event[];
    getSlotForDate: (date: Date) => Date | undefined;
    last: Date;
    levels: Segment[][];
    range: Date[];
    slots: number;
  }

  interface TimeSlotMetricsOptions {
    min: Date;
    max: Date;
    step: number;
    timeslots: number;
  }

  interface TimeSlotMetrics<
    TimeSlotMetricsOptions = Record<string, undefined>,
  > {
    groups: Date[][];
    update: (
      options: TimeSlotMetricsOptions,
    ) => TimeSlotMetrics<TimeSlotMetricsOptions>;
    dateIsInGroup: (date: Date, groupIndex: number) => boolean;
    nextSlot: (slot: Date) => Date;
    closestSlotToPosition: (percent: number) => Date;
    closestSlotFromPoint: (
      point: Point | SelectedRect,
      boundaryRect: NodeBounds,
    ) => Date;
    closestSlotFromDate: (date: Date, offset?: number) => Date;
    startsBeforeDay: (date: Date) => boolean;
    startsAfterDay: (date: Date) => boolean;
    startsBefore: (date: Date) => boolean;
    startsAfter: (date: Date) => boolean;
    getRange: (
      rangeStart: Date,
      rangeEnd: Date,
      ignoreMin?: boolean,
      ignoreMax?: boolean,
    ) => {
      end: number;
      endDate: Date;
      height: number;
      start: number;
      startDate: Date;
      top: number;
    };
    getCurrentTimePosition: (rangeStart: Date) => number;
  }

  interface GetStyledEventsOptions {
    events: RNC.Event[];
    slotMetrics: TimeSlotMetrics<TimeSlotMetricsOptions>;
    minimumStartDifference: number;
    dayLayoutAlgorithm?: DayLayoutAlgorithm;
  }

  interface StyledEventStyle {
    height: number | string;
    top: number | 'inherit';
    left?: number;
    width: number | string;
    /**
     * xOffset will not be defined while dragging
     */
    xOffset?: number | string;
  }

  interface StyledEvent {
    event: RNC.Event;
    style: StyledEventStyle;
    friends?: StyledEvent[];
    idx?: number;
    size?: number;
  }

  type Component = <P = Record<string, unknown>>(
    props: P,
  ) => React.ReactElement;

  type AgendaComponents = {
    event?: Component;
    time?: Component;
    date?: Component;
  };

  type DayComponents = {
    event?: Component;
    header?: Component;
  };

  type WeekComponents = {
    event?: Component;
    header?: Component;
  };

  type MonthComponents = {
    event?: Component;
    header?: Component;
    dateHeader?: Component;
  };

  /**
   * Customize how different sections of the calendar render by providing custom
   * Components. In particular the `Event` component can be specified for the
   * entire calendar, or you can provide an individual component for each view
   * type.
   *
   * ```jsx
   * let components = {
   *   event: MyEvent, // used by each view (Month, Day, Week)
   *   eventWrapper: MyEventWrapper,
   *   eventContainerWrapper: MyEventContainerWrapper,
   *   dateCellWrapper: MyDateCellWrapper,
   *   timeSlotWrapper: MyTimeSlotWrapper,
   *   timeGutterHeader: MyTimeGutterWrapper,
   *   toolbar: MyToolbar,
   *   agenda: {
   *     // with the agenda view use a different component to render events
   *   	 event: MyAgendaEvent
   *     time: MyAgendaTime,
   *     date: MyAgendaDate,
   *   },
   *   day: {
   *     header: MyDayHeader,
   *     event: MyDayEvent,
   *   },
   *   week: {
   *     header: MyWeekHeader,
   *     event: MyWeekEvent,
   *   },
   *   month: {
   *     header: MyMonthHeader,
   *     dateHeader: MyMonthDateHeader,
   *     event: MyMonthEvent,
   *   }
   * }
   * <Calendar components={components} />
   * ```
   */
  type Components = {
    /**
     * Wrap event by something else.
     *
     * If you are going to wrap the event with any element, we recommend adding
     * `height: 100%` style to it
     */
    eventWrapper: Component;
    eventContainerWrapper: Component;
    dateCellWrapper: Component;
    timeSlotWrapper: Component;
    weekWrapper: Component;

    event?: Component;
    timeGutterHeader?: Component;
    resourceHeader?: Component;
    toolbar?: Component;

    /**
     * with the agenda view use a different component to render events
     */
    agenda: AgendaComponents;

    day: DayComponents;

    week: WeekComponents;

    work_week: WeekComponents;

    month: MonthComponents;
  };

  type GetDrilldownView = (date: Date) => View | null;

  /**
   * Determines the current date/time which is highlighted in the views.
   *
   * The value affects which day is shaded and which time is shown as
   * the current time. It also affects the date used by the Today button in
   * the toolbar.
   *
   * Providing a value here can be useful when you are implementing time zones
   * using the `startAccessor` and `endAccessor` properties.
   *
   * @type {func}
   * @defaultValue () => new Date()
   */
  type GetNow = () => Date;

  /**
   * Callback fired when dragging a selection in the Time views.
   *
   * Returning `false` from the handler will prevent a selection.
   *
   * ```js
   * (range: { start: Date, end: Date, resourceId: (number|string) }) => ?boolean
   * ```
   */
  type OnSelecting = (range: {
    start: Date;
    end: Date;
    resourceId: resourceId;
  }) => boolean;

  declare module '*.mdx' {
    const MDXComponent: () => JSX.Element;
    export default MDXComponent;
  }
}
