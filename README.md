
<!-- README.md is generated from README.Rmd. Please edit that file -->

# DataSum

<!-- badges: start -->

[![CRAN status](https://www.r-pkg.org/badges/version/DataSum)](https://CRAN.R-project.org/package=DataSum)
[![R-CMD-check](https://github.com/Uzairkhan11w/DataSum/actions/workflows/R-CMD-check.yaml/badge.svg)](https://github.com/Uzairkhan11w/DataSum/actions/workflows/R-CMD-check.yaml)
<!-- badges: end -->

DataSum is a modern diagnostic companion for statisticians, professors,
scientists, and analysts. It turns an ordinary data frame into robust summaries,
missingness checks, outlier flags, normality diagnostics, grouped profiles, and
publication-ready report scaffolds.

The 1.0 API is intentionally clean:

- `summarize_vector()` summarizes one variable.
- `summarize_data()` summarizes a data frame, optionally by groups.
- `profile_data()` creates a dataset-level diagnostic profile.
- `datasum_report()` writes a reproducible Quarto diagnostic report.
- `run_datasum_app()` launches an interactive Shiny app.

## Installation

``` r
install.packages("DataSum")
```

Development version:

``` r
# install.packages("remotes")
remotes::install_github("Uzairkhan11w/DataSum")
```

## Example

``` r
library(DataSum)

summarize_vector(c(1, 2, 2, NA, 10), name = "score")

summarize_data(iris, by = "Species")

profile <- profile_data(iris)
profile$dataset
profile$warnings
```

## Diagnostic reports

``` r
report_path <- datasum_report(iris, format = "qmd", render = FALSE)
report_path
```

Set `render = TRUE` with the optional `quarto` package to render HTML, PDF, or
DOCX output.

## Interactive app

``` r
run_datasum_app()
```

The Shiny app supports CSV upload, variable inspection, diagnostic summaries,
warnings, quick plots, and report download.

## Why this exists

First-pass data summaries are often either too shallow for serious statistical
work or too scattered across many manual commands. DataSum aims to make the
first diagnostic pass rigorous, teachable, reproducible, and fast enough to be
part of everyday research workflows.
