const getReportProperty = (json: object, path: string) => {
  return path.split(".").reduce((acc, curr) => {
    if (!acc)
      throw new Error(`Failed to index into report: "${curr}" in "${path}`);
    return acc[curr];
  }, json);
};

const averageValue = (reportList: object[], path: string) => {
  const avg =
    reportList.reduce((acc, curr) => {
      return acc + getReportProperty(curr, path);
    }, 0) / reportList.length;
  if (isNaN(avg)) throw new Error(`Failed to average value for path: ${path}`);
  return avg;
};

export { getReportProperty, averageValue };
