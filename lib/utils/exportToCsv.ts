/**
 * Converts an array of objects to CSV format and triggers download
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file (without extension)
 * @param headers - Optional custom headers mapping { displayName: 'key' }
 */
export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>
) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get all unique keys from the data
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  // Use custom headers if provided, otherwise use keys
  const keys = headers ? Object.values(headers) : Array.from(allKeys);
  const headerLabels = headers
    ? Object.keys(headers)
    : Array.from(allKeys);

  // Create CSV header row
  const csvHeader = headerLabels.map((label) => escapeCsvValue(label)).join(",");

  // Create CSV data rows
  const csvRows = data.map((item) => {
    return keys
      .map((key) => {
        const value = getNestedValue(item, key);
        return escapeCsvValue(value);
      })
      .join(",");
  });

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join("\n");

  // Add BOM for Excel compatibility
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csvContent;

  // Create blob and download
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${formatDateForFilename()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Escapes CSV values to handle commas, quotes, and newlines
 */
const escapeCsvValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Gets nested value from object using dot notation (e.g., "user.name")
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

/**
 * Formats current date for filename (YYYY-MM-DD_HH-MM-SS)
 */
const formatDateForFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};
