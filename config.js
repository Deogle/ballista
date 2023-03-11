const AuditTypes = Object.freeze({
  PERFORMANCE: "categories.performance.score",
  FIRST_CONTENTFUL_PAINT: "first-contentful-paint",
  FIRST_MEANINGFUL_PAINT: "first-meaningful-paint",
  SPEED_INDEX: "speed-index",
  INTERACTIVE: "interactive",
  CUMULATIVE_LAYOUT_SHIFT: "cumulative-layout-shift",
});

const config = [
  {
    id: AuditTypes.PERFORMANCE,
    displayName: "Performance Score (avg)",
    toString: (value) => `${(value * 100).toFixed(0)}`,
    absolutePath: true,
  },
  {
    id: AuditTypes.FIRST_CONTENTFUL_PAINT,
    displayName: "First Contentful Paint (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.FIRST_MEANINGFUL_PAINT,
    displayName: "First Meaningful Paint (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.SPEED_INDEX,
    displayName: "Speed Index (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.INTERACTIVE,
    displayName: "Time to Interactive (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.CUMULATIVE_LAYOUT_SHIFT,
    displayName: "Cumulative Layout Shift (avg)",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
];

export { config, AuditTypes };
