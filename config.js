const AuditTypes = Object.freeze({
  PERFORMANCE: "categories.performance.score",
  FIRST_CONTENTFUL_PAINT: "audits.first-contentful-paint.numericValue",
  FIRST_MEANINGFUL_PAINT: "audits.first-meaningful-paint.numericValue",
  SPEED_INDEX: "audits.speed-index.numericValue",
  INTERACTIVE: "audits.interactive.numericValue",
  CUMULATIVE_LAYOUT_SHIFT: "audits.cumulative-layout-shift.numericValue",
});

const config = [
  {
    path: AuditTypes.PERFORMANCE,
    displayName: "Performance Score (avg)",
    toString: (value) => `${(value * 100).toFixed(0)}`,
    absolutePath: true,
  },
  {
    path: AuditTypes.FIRST_CONTENTFUL_PAINT,
    displayName: "First Contentful Paint (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    path: AuditTypes.FIRST_MEANINGFUL_PAINT,
    displayName: "First Meaningful Paint (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    path: AuditTypes.SPEED_INDEX,
    displayName: "Speed Index (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    path: AuditTypes.INTERACTIVE,
    displayName: "Time to Interactive (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    path: AuditTypes.CUMULATIVE_LAYOUT_SHIFT,
    displayName: "Cumulative Layout Shift (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
];

export { config, AuditTypes };
