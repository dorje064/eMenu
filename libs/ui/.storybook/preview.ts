import type { Preview } from '@storybook/react-vite';
import '../src/styles/global.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Design System',
          ['Introduction', 'Colors', 'Typography'],
          'Components',
        ],
      },
    },
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: '#f9fafb' },
        { name: 'card', value: '#ffffff' },
        { name: 'dark', value: '#0b0f19' },
      ],
    },
  },
};

export default preview;
