/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers. If not provided, uses object keys
 * @returns CSV string
 */
export const convertToCSV = (data: any[], headers?: string[]): string => {
  if (!data || data.length === 0) {
    return "";
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSV = (value: any): string => {
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

  // Create header row
  const headerRow = csvHeaders.map(escapeCSV).join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    return csvHeaders.map((header) => {
      const value = row[header];
      return escapeCSV(value);
    }).join(",");
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
};

/**
 * Downloads CSV data as a file
 * @param csvContent CSV string content
 * @param filename Name of the file to download
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  // Add BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports data array to CSV file
 * @param data Array of objects to export
 * @param filename Name of the file to download
 * @param headers Optional custom headers
 */
export const exportToCSV = (data: any[], filename: string, headers?: string[]): void => {
  const csvContent = convertToCSV(data, headers);
  if (csvContent) {
    downloadCSV(csvContent, filename);
  }
};

