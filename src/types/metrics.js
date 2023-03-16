const MetricPaths = Object.freeze({
  PERFORMANCE: "categories.performance.score",
  FIRST_CONTENTFUL_PAINT: "audits.first-contentful-paint.numericValue",
  FIRST_MEANINGFUL_PAINT: "audits.first-meaningful-paint.numericValue",
  SPEED_INDEX: "audits.speed-index.numericValue",
  INTERACTIVE: "audits.interactive.numericValue",
  CUMULATIVE_LAYOUT_SHIFT: "audits.cumulative-layout-shift.numericValue",
});

const MetricNames = Object.freeze({
  PERFORMANCE: "performance",
  FIRST_CONTENTFUL_PAINT: "first-contentful-paint",
  FIRST_MEANINGFUL_PAINT: "first-meaningful-paint",
  SPEED_INDEX: "speed-index",
  INTERACTIVE: "interactive",
  CUMULATIVE_LAYOUT_SHIFT: "cumulative-layout-shift",
});

const PRECISION = 2;

const MetricsConfigs = Object.freeze({
  [MetricNames.PERFORMANCE]: {
    name: MetricNames.PERFORMANCE,
    path: MetricPaths.PERFORMANCE,
    displayName: "Performance Score (avg)",
    toString: (value) => `${(value * 100).toFixed(0)}`,
    absolutePath: true,
  },
  [MetricNames.FIRST_CONTENTFUL_PAINT]: {
    name: MetricNames.FIRST_CONTENTFUL_PAINT,
    path: MetricPaths.FIRST_CONTENTFUL_PAINT,
    displayName: "First Contentful Paint (avg)",
    toString: (value) => `${(value / 1000).toFixed(PRECISION)} s`,
  },
  [MetricNames.FIRST_MEANINGFUL_PAINT]: {
    name: MetricNames.FIRST_MEANINGFUL_PAINT,
    path: MetricPaths.FIRST_MEANINGFUL_PAINT,
    displayName: "First Meaningful Paint (avg)",
    toString: (value) => `${(value / 1000).toFixed(PRECISION)} s`,
  },
  [MetricNames.SPEED_INDEX]: {
    name: MetricNames.SPEED_INDEX,
    path: MetricPaths.SPEED_INDEX,
    displayName: "Speed Index (avg)",
    toString: (value) => `${(value / 1000).toFixed(PRECISION)} s`,
  },
  [MetricNames.INTERACTIVE]: {
    name: MetricNames.INTERACTIVE,
    path: MetricPaths.INTERACTIVE,
    displayName: "Time to Interactive (avg)",
    toString: (value) => `${(value / 1000).toFixed(PRECISION)} s`,
  },
  [MetricNames.CUMULATIVE_LAYOUT_SHIFT]: {
    name: MetricNames.CUMULATIVE_LAYOUT_SHIFT,
    path: MetricPaths.CUMULATIVE_LAYOUT_SHIFT,
    displayName: "Cumulative Layout Shift (avg)",
    toString: (value) => `${(value / 1000).toFixed(PRECISION)} s`,
  },
});

const Metrics = Object.freeze({
  PERFORMANCE: MetricsConfigs[MetricNames.PERFORMANCE],
  FIRST_CONTENTFUL_PAINT: MetricsConfigs[MetricNames.FIRST_CONTENTFUL_PAINT],
  FIRST_MEANINGFUL_PAINT: MetricsConfigs[MetricNames.FIRST_MEANINGFUL_PAINT],
  SPEED_INDEX: MetricsConfigs[MetricNames.SPEED_INDEX],
  INTERACTIVE: MetricsConfigs[MetricNames.INTERACTIVE],
  CUMULATIVE_LAYOUT_SHIFT: MetricsConfigs[MetricNames.CUMULATIVE_LAYOUT_SHIFT],
});

export { Metrics, MetricNames, MetricPaths };
