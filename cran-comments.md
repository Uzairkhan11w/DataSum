## Test environments

- GitHub Actions: ubuntu-latest, R-release
- GitHub Actions: macOS-latest, R-release
- GitHub Actions: windows-latest, R-release
- Local maintainer check should be run before submission with `devtools::check(args = "--as-cran")`

## R CMD check results

0 errors | 0 warnings | 0 notes expected before submission.

## Release summary

This is a major release of DataSum. Version 1.0.0 intentionally replaces the early prototype API with a clean diagnostics platform API:

- `summarize_vector()`
- `summarize_data()`
- `profile_data()`
- `datasum_report()`
- `run_datasum_app()`

The release adds NA-aware summaries, robust statistics, missingness diagnostics, normality decisions with p-values and test names, grouped summaries, a Quarto report scaffold, a Shiny app, tests, and GitHub Actions checks.

## Reverse dependencies

There are no known reverse dependencies.
