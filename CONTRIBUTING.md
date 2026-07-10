# Contributing to DataSum

Thank you for helping make DataSum more useful for statistical teaching, research, and reproducible analysis.

## Good contributions

Useful contributions include:

- bug reports with a minimal reproducible example
- test cases for edge cases such as missing values, tied modes, constant vectors, grouped summaries, and unusual column classes
- statistical-method discussions with references or clear formula definitions
- documentation improvements for professors, students, scientists, and applied analysts
- Shiny app usability improvements
- report-template improvements for publication workflows

## Development setup

Use a recent R release, preferably R 4.1 or newer.

```r
install.packages(c("devtools", "testthat", "roxygen2", "pkgdown"))
devtools::load_all()
devtools::test()
devtools::document()
devtools::check()
```

For website work, run:

```r
pkgdown::build_site()
```

For CRAN preparation, run:

```r
devtools::check(args = "--as-cran")
```

## Pull requests

Before opening a pull request:

- keep the change focused
- add or update tests when behavior changes
- update documentation for user-facing changes
- run `devtools::test()` and, when possible, `devtools::check()`
- explain statistical changes clearly, including formulas, thresholds, and assumptions

## Statistical changes

Changes to formulas, normality decisions, missingness warnings, robust statistics, or outlier rules should include:

- a clear motivation
- references where appropriate
- examples showing expected behavior
- tests for edge cases

## Conduct

By participating, you agree to follow the project code of conduct in `CODE_OF_CONDUCT.md`.

## Security

Please do not open public issues for security concerns. Use the process in `SECURITY.md` instead.
