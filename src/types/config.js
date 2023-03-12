import { Metrics } from "./metrics.js";

const defaultConfig = [
  Metrics.PERFORMANCE,
  Metrics.FIRST_CONTENTFUL_PAINT,
  Metrics.FIRST_MEANINGFUL_PAINT,
  Metrics.SPEED_INDEX,
  Metrics.INTERACTIVE,
  Metrics.CUMULATIVE_LAYOUT_SHIFT,
];

const config = defaultConfig;

export { config };
