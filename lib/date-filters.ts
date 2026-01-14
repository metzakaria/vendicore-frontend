type TimeFilter = "today" | "7days" | "14days" | "30days" | "3months" | "year";

const getDateRange = (filter: TimeFilter) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const endDate = today.toISOString();

  let startDate: Date;
  switch (filter) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "14days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "30days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "3months":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate: startDate.toISOString(),
    endDate,
  };
};

const getFilterLabel = (filter: TimeFilter) => {
  switch (filter) {
    case "today":
      return "Today";
    case "7days":
      return "Last 7 Days";
    case "14days":
      return "Last 2 Weeks";
    case "30days":
      return "Last 30 Days";
    case "3months":
      return "Last 3 Months";
    case "year":
      return "Last Year";
    default:
      return "Today";
  }
};

export { TimeFilter, getDateRange, getFilterLabel };
