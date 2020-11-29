import invariant from 'tiny-invariant';

interface DateLocalizerProps {
  firstOfWeek: StartOfWeek;
  format: Format;
  formats: Formats;
}

function _format(
  localizer: Omit<Localizer, 'messages'>,
  formatter: Format,
  value: Date | { start: Date; end: Date },
  format: ValueOf<Formats>,
  culture?: string,
) {
  const result =
    typeof format === 'function'
      ? format(
          value as { start: Date; end: Date },
          culture,
          localizer as Localizer,
        )
      : formatter.call(localizer, value, format, culture);

  invariant(
    result == null || typeof result === 'string',
    '`localizer format(..)` must return a string, null, or undefined',
  );

  return result;
}

export class DateLocalizer implements Omit<Localizer, 'messages'> {
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
      format: keyof Formats | ValueOf<Formats>,
    ) =>
      localizer.format(
        value,
        formats[format as keyof Formats] || format,
        culture,
      ),
  };
}
