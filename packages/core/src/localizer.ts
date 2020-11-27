import invariant from 'tiny-invariant';

interface DateLocalizerProps {
  firstOfWeek: StartOfWeek;
  format: Format;
  formats: Formats;
}

function _format(
  localizer: Localizer,
  formatter: Format,
  value: Date | { start: Date; end: Date },
  format: string | RangeFormat | RangeStartFormat | RangeEndFormat,
  culture?: string,
) {
  const result =
    typeof format === 'function'
      ? format(value as { start: Date; end: Date }, culture, localizer)
      : formatter.call(localizer, value, format, culture);

  invariant(
    result == null || typeof result === 'string',
    '`localizer format(..)` must return a string, null, or undefined',
  );

  return result;
}

export class DateLocalizer {
  public startOfWeek: StartOfWeek;
  public formats: Formats;
  public format: Format;

  public constructor(spec: DateLocalizerProps) {
    invariant(
      typeof spec.format === 'function',
      'date localizer `format(..)` must be a function',
    );
    invariant(
      typeof spec.firstOfWeek === 'function',
      'date localizer `firstOfWeek(..)` must be a function',
    );

    this.startOfWeek = spec.firstOfWeek;
    this.formats = spec.formats;
    this.format = (...args) => _format(this, spec.format, ...args);
  }
}

export function mergeWithDefaults(
  localizer: Localizer,
  formatOverrides: Formats,
  messages: Messages,
  culture?: string,
): Localizer {
  const formats = {
    ...localizer.formats,
    ...formatOverrides,
  };

  return {
    ...localizer,
    messages,
    startOfWeek: () => localizer.startOfWeek(culture),
    format: (
      value: Date | { start: Date; end: Date },
      format: keyof Formats | string,
    ) => localizer.format(value, formats[format] || format, culture),
  };
}
