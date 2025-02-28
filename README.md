
<!-- README.md is generated from README.Rmd. Please edit that file -->

# DataSum

<!-- badges: start -->
<!-- badges: end -->

The goal of DataSum is to provide functions for summarizing data frames
by calculating various statistical measures, including measures of
central tendency, dispersion, skewness, kurtosis, and normality tests.
The package leverages the moments package for calculating statistical
moments and related measures, the dplyr package for data manipulation,
and the nortest package for normality testing.

Functions getmode: Takes a data vector as input and returns the mode(s)
of the data. shapiro_normality_test: Performs a Shapiro-Wilk normality
test on the input data. If the data length is outside the valid range
for the Shapiro-Wilk test (3 to 5000), it performs an Anderson-Darling
normality test instead. Datum: Takes a data vector as input and returns
a data frame with various summary statistics, including data type,
sample size, mean, mode, median, variance, standard deviation, maximum,
minimum, range, skewness, kurtosis, and normality test result. DataSumm:
Takes a data frame as input and applies the Datum function to each
column, returning a data frame with the summary statistics for each
column. Measures of Central Tendency Mean: The average of the values.
Median: The middle value when the data is arranged in order. Mode: The
value that appears most frequently in the data set. Measures of
Dispersion Range: The difference between the largest and smallest values
in the data set. Variance: A measure of how spread out the values are
from the mean. Standard Deviation: The square root of the variance.
Other Measures Skewness: A measure of the asymmetry of the probability
distribution. Kurtosis: A measure of the “peakedness” of the probability
distribution. Normality: A test to determine if the data follows a
normal (Gaussian) distribution, such as the Shapiro-Wilk test.

## Installation

You can install the released version of DataSum from CRAN with:

``` r
install.packages("DataSum")
```

## Example

This is a basic example which shows you how to solve a common problem:

Example 1: `getmode`

``` r
library(DataSum)

# Example data
data <- c(1, 2, 2, 3, 4)

# Get the mode
mode <- getmode(data)
print(mode)
```

Example 2: `shapiro_normality_test`

``` r
# Perform Shapiro-Wilk normality test
test_result <- shapiro_normality_test(data)
print(test_result)
```

Example 3: `Datum`

``` r
# Get summary statistics for a numeric vector
datum_summary <- Datum(data)
print(datum_summary)
```

Example 4: `DataSumm`

``` r
# Summarize the iris dataset
summary_df <- DataSumm(iris)
print(summary_df)
```
