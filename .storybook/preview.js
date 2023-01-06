import { DocsPage, DocsContainer } from '@storybook/addon-docs';

import '../packages/core/src/sass/styles.scss';
import '../packages/dnd/styles.scss';

export const parameters = {
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
  controls: { expanded: true },
  options: {
    storySort: {
      order: [
        'Getting Started',
        'Core',
        ['Basic usage', 'Default view', 'Complex day view layout'],
        'dnd',
        ['Basic usage'],
        'Event Durations',
        'Resources',
        'Timeslots',
        'Issues',
      ],
    },
  },
};
