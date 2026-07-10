# CRAN Release Checklist

This checklist is for preparing a DataSum release for CRAN.

## Before submission

1. Confirm `DESCRIPTION` has the correct version, title, description, maintainer, URL, BugReports, license, imports, suggests, and vignette builder.
2. Update `NEWS.md` for the release.
3. Run package documentation:

```r
devtools::document()
```

4. Run tests:

```r
devtools::test()
```

5. Run a full check:

```r
devtools::check(args = "--as-cran")
```

6. Build the source package:

```r
devtools::build()
```

7. Submit the generated `.tar.gz` file at the CRAN submission page:

https://cran.r-project.org/submit.html

8. Confirm the submission from the maintainer email address listed in `DESCRIPTION`.

## Notes for DataSum 1.0.0

DataSum 1.0.0 is a major API redesign. The CRAN submission comments should clearly explain that this intentionally replaces the early prototype API with a cleaner diagnostics platform API.

## After CRAN accepts

1. Update the README release-status note if needed.
2. Create a GitHub release with the accepted version.
3. Confirm the pkgdown site points users to the accepted release and current development instructions.
