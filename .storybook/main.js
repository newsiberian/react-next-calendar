// import { configure, addParameters } from '@storybook/react'
// import rbcTheme from './rbc.theme'
//
// addParameters({
//   options: {
//     theme: rbcTheme,
//   },
// })
//
// function loadStories() {
//   require('../stories')
// }
//
// configure(loadStories, module)
module.exports = {
  stories: ['../stories/*.stories.@(js|mdx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-controls'],
}
