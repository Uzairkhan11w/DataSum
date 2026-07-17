# Public shinyapps.io entry point for DataSum.
#
# The deployment workflow installs DataSum from the exact GitHub commit being
# deployed, so this app remains aligned with the repository source.
library(DataSum)

DataSum::run_datasum_app()
