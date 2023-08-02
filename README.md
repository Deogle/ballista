# Ballista

> A minimal JS module and small CLI utility for running _concurrent_ Lighthouse tests. Run multiple iterations across multiple URLs to reduce the friction of performance benchmarking.

## Prerequisites (local development)

- Node.js version 10 or higher
- Google Chrome browser version 59 or higher

## Installation

To install Ballista as a global cli tool, run the following command

```
npm install -g @deogle/ballista
```

Or to add the package as a dependency

```
npm install -S @deogle/ballista
```

## Usage

The basic usage of the CLI tool follows the form

```
ballista -i 5 -c --url <baseline-url> <target-urls>
```

Where

- `baseline-url` the url being benchmarked against.
- `target-urls` a space delimited list of urls to run test against the benchmark
- `-c` run in comparison mode
- `-i` sets the number of iterations to run (the more iterations, the more accurate the results but the longer the total runtime).
