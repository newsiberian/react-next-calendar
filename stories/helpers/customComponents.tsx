import * as React from 'react';
import { action } from '@storybook/addon-actions';

const customComponents = {
  dateCellWrapper: (props: {
    range: Date[];
    children: React.ReactNode;
  }): React.ReactElement => {
    // Show 'click me' text in arbitrary places by using the range prop
    const hasAlert = props.range
      ? props.range.some((date: Date) => {
          return date.getDate() % 12 === 0;
        })
      : false;

    const style = {
      display: 'flex',
      flex: 1,
      borderLeft: '1px solid #DDD',
      backgroundColor: hasAlert ? '#f5f5dc' : '#fff',
    };
    return (
      <div style={style}>
        {hasAlert && (
          <a onClick={action('custom dateCellWrapper component clicked')}>
            Click me
          </a>
        )}
        {props.children}
      </div>
    );
  },
  dayWrapper: (props: {
    value: Date;
    children: React.ReactNode;
  }): React.ReactElement => {
    // Show different styles at arbitrary time
    const hasCustomInfo = props.value ? props.value.getHours() === 4 : false;
    const style = {
      display: 'flex',
      flex: 1,
      backgroundColor: hasCustomInfo ? '#f5f5dc' : '#fff',
    };
    return (
      <div style={style}>
        {hasCustomInfo && 'Custom Day Wrapper'}
        {props.children}
      </div>
    );
  },
  eventWrapper: (props: {
    event: RNC.Event;
    children: React.ReactNode;
  }): React.ReactElement => {
    const style = {
      border: '4px solid',
      borderColor: props.event.start.getHours() % 2 === 0 ? 'green' : 'red',
      padding: '5px',
    };
    return <div style={style}>{props.children}</div>;
  },
  timeSlotWrapper: (props: {
    value: Date;
    resource: unknown;
    children: React.ReactNode;
  }): React.ReactElement => {
    const style =
      props.resource === null || props.value.getMinutes() !== 0
        ? {}
        : {
            border: '4px solid',
            backgroundColor:
              props.value.getHours() >= 8 && props.value.getHours() <= 17
                ? 'green'
                : 'red',
            padding: '5px',
          };
    return <div style={style}>{props.children}</div>;
  },
  header: (props: { label: string }): React.ReactElement => {
    const style = {
      border: '4px solid',
      borderColor: 'red',
    };
    return <div style={style}>{props.label}</div>;
  },
};

export default customComponents;
