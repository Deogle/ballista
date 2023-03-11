const AuditTypes = Object.freeze({
  FIRST_CONTENTFUL_PAINT: "first-contentful-paint",
  FIRST_MEANINGFUL_PAINT: "first-meaningful-paint",
  SPEED_INDEX: "speed-index",
  INTERACTIVE: "interactive",
  CUMULATIVE_LAYOUT_SHIFT: "cumulative-layout-shift",
});

const config = [
  {
    id: AuditTypes.FIRST_CONTENTFUL_PAINT,
    displayName: "First Contentful Paint",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.FIRST_MEANINGFUL_PAINT,
    displayName: "First Meaningful Paint",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.SPEED_INDEX,
    displayName: "Speed Index",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.INTERACTIVE,
    displayName: "Time to Interactive",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
  {
    id: AuditTypes.CUMULATIVE_LAYOUT_SHIFT,
    displayName: "Cumulative Layout Shift",
    toString: (value) => `${(value / 1000).toFixed(5)} s`,
  },
];

export { config, AuditTypes };
