# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.1](https://github.com/newsiberian/react-next-calendar/compare/v1.0.0...v1.0.1) (2021-09-08)


### Bug Fixes

* **core:** place outer div outside EventWrapper to keep positioning on top of the second. This fixes custom eventWrapper positioning at time grid ([d3215be](https://github.com/newsiberian/react-next-calendar/commit/d3215be1132dcc8e8aa41b91badb35d4570cab66))
* **core:** use internal rootRef instead of external `callback ref` to get popup sizes ([d237cd7](https://github.com/newsiberian/react-next-calendar/commit/d237cd7fa7ef6df1eaf3e42b5c02d793680dd2c7))





# [1.0.0](https://github.com/newsiberian/react-next-calendar/compare/v0.28.1...v1.0.0) (2020-12-01)


### Bug Fixes

* avoid useless gutter measure ([0d96595](https://github.com/newsiberian/react-next-calendar/commit/0d9659545bffa1d286104455cd9d0546beb5ccaf))
* wrong argument in `handleRangeChange` ([be238db](https://github.com/newsiberian/react-next-calendar/commit/be238db481781ae4082212202742834f71e64142))


* BREAKING CHANGE: Rename core esm file to `react-next-calendar.esm.js` and core css file to `react-next-calendar.css` ([05983b9](https://github.com/newsiberian/react-next-calendar/commit/05983b91b868c30e4dcab848b0ffacdde1872ae5))


### BREAKING CHANGES

* Don't pass sass files to dist

refactor(core): improve typings
chore(core): change invariant to tiny-invariant
chore: add ts-jest
