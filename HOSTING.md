# Hosting the DataSum web app

This repository contains a production entry point at
`inst/shiny-app/app.R` and a GitHub Actions workflow named **Deploy DataSum
Shiny app**. Together they publish the interactive DataSum interface to
[shinyapps.io](https://www.shinyapps.io/) without requiring visitors to install
R or DataSum.

After deployment, the public URL is:

```text
https://<your-shinyapps-account>.shinyapps.io/datasum/
```

The deployment workflow installs DataSum from the exact GitHub commit being
deployed. This keeps the hosted app aligned with the current 1.0.0 source even
while CRAN mirrors are still catching up.

## One-time owner setup

1. Create or sign in to a shinyapps.io account. Choosing
   `uzairkhan11w` as the account name is ideal if it is available.
2. In the shinyapps.io dashboard, open your profile menu and choose
   **Tokens**. Create or reveal a token and secret.
3. In the DataSum GitHub repository, open
   **Settings -> Secrets and variables -> Actions -> New repository secret**.
4. Add these three repository secrets:

   | Secret name | Value |
   |---|---|
   | `SHINYAPPS_ACCOUNT` | Your shinyapps.io account name |
   | `SHINYAPPS_TOKEN` | The token from shinyapps.io |
   | `SHINYAPPS_SECRET` | The secret from shinyapps.io |

   Keep the token and secret private. Do not place them in source files,
   issues, screenshots, or chat messages.
5. Open the repository's **Actions** tab, select **Deploy DataSum Shiny app**,
   choose **Run workflow**, and run it on `master`.
6. When the run is green, open the URL shown in the workflow summary. The app
   will be available publicly at the URL above.

## Updates

Future changes to the DataSum R code, app entry point, package metadata, or
this workflow automatically redeploy the public app after the three secrets are
configured. Documentation-only edits do not trigger deployment.

## Data handling

The app does not intentionally save uploaded CSV files. However, it is a public
cloud service: users should not upload confidential, personally identifiable,
or restricted research data unless an appropriate institutional hosting and
data-protection arrangement is in place.
