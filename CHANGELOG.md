# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 0.0.1 (2026-09-13)

### Features

* add name, path and testplan utilities ([11b79b7](https://github.com/vara855/allure-rstest/commit/11b79b7cd08b74441dd5e5d0bdc5d7316702dee1))
* allow disabling the allure integration via ALLURE_ENABLED or enabled option ([cb8ad00](https://github.com/vara855/allure-rstest/commit/cb8ad0089f62c5d5dcf10f11a7be8e9a53be7379))
* auto-clean resultsDir and validate reporter config ([f82108e](https://github.com/vara855/allure-rstest/commit/f82108e8086481efceb48468dc8c0b44285f914e))
* deliver allure runtime messages through rstest task meta ([5d27fed](https://github.com/vara855/allure-rstest/commit/5d27fedadd645d7ba9203c69ea2557f119320130))
* diagnose missing setup file and unverified rstest versions ([b7b5617](https://github.com/vara855/allure-rstest/commit/b7b561759984dba8d412deaa47018f01b7bfece8))
* expose async, sync and namespaced allure api with component labels ([44a3898](https://github.com/vara855/allure-rstest/commit/44a3898bdaa6f13fdbe0dcb70aaf8d8e56139b0d))
* map rstest results to allure model in the reporter ([863ac3f](https://github.com/vara855/allure-rstest/commit/863ac3fdaa3d4925092f5d9fada57bf38c635768))
* report expect matchers as allure steps ([87ada06](https://github.com/vara855/allure-rstest/commit/87ada06abd1475c0cf516c38321270c3db23359c))
* report suite hook errors, retries and testplan filtering ([2b1bff9](https://github.com/vara855/allure-rstest/commit/2b1bff9e0baa9cb0e3e34dff7350e992ab101e8c))
* resolve current rstest test via AsyncLocalStorage api wrapper ([fe7c646](https://github.com/vara855/allure-rstest/commit/fe7c646fb6bf9500209e973b3147c0af31587ca5))
* support declarative allure metadata via rstest test meta ([a827dc7](https://github.com/vara855/allure-rstest/commit/a827dc7cbd246086650a6f4513d572dbe8aee641))
* support rstest browser mode ([e197b8f](https://github.com/vara855/allure-rstest/commit/e197b8f38887f38bf2183032d7aa3ae0929da870))

### Bug Fixes

* keep the legacy allure global defined as a no-op when disabled ([42ade19](https://github.com/vara855/allure-rstest/commit/42ade19a5a9f44c7fbf0e250a6b9b78ff3c36f01))
* make AllureMeta assignable to rstest TaskMeta so allureMeta works in test/describe meta ([3787314](https://github.com/vara855/allure-rstest/commit/3787314ff64320c9834bb1595e2f8ac6ce0b827a))
* write global messages immediately and reset setup flag between runs ([1f9d7d5](https://github.com/vara855/allure-rstest/commit/1f9d7d5602043f066d3b0dbc060bc91a628edb38))
