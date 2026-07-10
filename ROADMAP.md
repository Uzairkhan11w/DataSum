# DataSum Roadmap

DataSum 1.0 begins the move from a small summary helper into a research diagnostics platform for R users.

## 1.0 foundation

- Clean public API: `summarize_vector()`, `summarize_data()`, `profile_data()`, `datasum_report()`, and `run_datasum_app()`.
- NA-aware summaries for numeric and non-numeric vectors.
- Robust statistics including median, IQR, MAD, skewness, excess kurtosis, and transparent outlier flags.
- Normality diagnostics that report the test, p-value, alpha, and decision.
- Grouped summaries for comparative workflows.
- Shiny app for local interactive exploration.
- Quarto report source generation.
- GitHub Actions checks on Linux, macOS, and Windows.

## Near-term priorities

- Make the pkgdown documentation site a polished public home for the package.
- Add screenshots and a short demo dataset walkthrough.
- Expand tests for Dates, POSIXct, ordered factors, labelled data, and very large data frames.
- Add a CRAN release workflow and artifact checklist.
- Improve report tables and interpretation notes for classroom and publication use.

## Research-platform ideas

- Better grouped diagnostics with effect-size helpers.
- Missingness-pattern views and variable-level data-quality scores.
- Correlation diagnostics and assumption-checking summaries.
- Export-ready tables for Word, HTML, and PDF workflows.
- Optional Shiny hosting guide for public demo deployments.
- Teaching vignettes for introductory statistics and research methods courses.

## Public app goal

The package includes a Shiny app that runs locally with `run_datasum_app()`. A public hosted app is a separate deployment target and should be handled through a service such as shinyapps.io or Posit Connect.

## Guiding principle

DataSum should be transparent before it is fancy. Every diagnostic should make its assumptions, formula, threshold, and limitation easy to understand.
