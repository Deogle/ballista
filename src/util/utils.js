const getReportProperty = (json, path) => {
  return path.split(".").reduce((acc, curr) => {
    if (!acc)
      throw new Error(`Failed to index into report: "${curr}" in "${path}`);
    return acc[curr];
  }, json);
};

const averageValue = (reportList, path) => {
  return (
    reportList.reduce((acc, curr) => {
      return acc + getReportProperty(curr, path);
    }, 0) / reportList.length
  );
};

export { getReportProperty, averageValue };