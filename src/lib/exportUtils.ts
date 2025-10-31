export function exportToCSV(
  data: any[],
  filename: string,
  headers: { key: string; label: string }[]
) {
  // Create CSV header row
  const headerRow = headers.map(h => h.label).join(',');
  
  // Create CSV data rows
  const dataRows = data.map(row => 
    headers.map(h => {
      const value = row[h.key];
      // Handle special characters and formatting
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""');
        return value.includes(',') ? `"${escaped}"` : escaped;
      }
      return value ?? '';
    }).join(',')
  );
  
  const csv = [headerRow, ...dataRows].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF() {
  // Use browser's native print functionality
  // User can save as PDF from the print dialog
  window.print();
}
