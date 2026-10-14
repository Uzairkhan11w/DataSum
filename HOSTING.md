# Publish the DataSum browser app on Cloudflare Pages

The browser app is a static site. It reads a CSV and calculates summaries in
the visitor's browser, so visitors do not install R and their CSV is not sent
to DataSum or Cloudflare. Cloudflare still receives the normal request
metadata needed to serve a public website.

## One-time setup

1. Sign in to the [Cloudflare dashboard](https://dash.cloudflare.com/) and open
   **Workers & Pages**.
2. Choose **Create application**, then **Pages** and **Connect to Git**.
3. Connect GitHub if asked, then choose **Uzairkhan11w/DataSum**.
4. Set the production branch to `master`.
5. Choose **None** for the framework preset. Leave the root directory and build
   command empty. Set the build output directory to `web`.
6. Create and deploy the project. Cloudflare will show the public address as
   `https://<project-name>.pages.dev` after the first deployment succeeds.

Choose the project name carefully. Cloudflare does not let you change a
project's `pages.dev` subdomain later. A suggested name is
`datasum-uzairkhan11w`, which gives `https://datasum-uzairkhan11w.pages.dev/`
if that name is available.

After the site is live, put its exact URL in the launch link at the top of the
GitHub README. The Cloudflare dashboard step is needed because the Pages
project must be created inside the owner's Cloudflare account.

## Future updates

Cloudflare's Git integration automatically deploys new commits from `master`.
The project serves the contents of the `web` directory, so the build command
stays empty and no R installation or build service is needed.

## What the browser app includes

- CSV upload and drag-and-drop, with an illustrative dataset available on load
- Dataset size, completeness, per-variable missingness, and duplicate-row scan
- Numeric summaries, distribution charts, and categorical frequency charts
- IQR outlier flags and downloadable summary CSV
- Method notes for quantiles, sample standard deviation, MAD, skewness,
  kurtosis, and the IQR rule

The browser app is an exploratory first look. For normality tests, grouped
summaries, and reproducible Quarto reports, install the full DataSum R package
from CRAN.

