import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BODSummaryData {
  company: {
    name: string;
    registration_no: string;
    address: string;
    phone: string;
    logo_url: string | null;
  };
  period: {
    display: string;
  };
  generatedDate: string;
  statistics: {
    totalEmployees: number;
    totalHours: number;
    totalCost: number;
    withViolations: number;
  };
  employees: Array<{
    employeeNo: string;
    name: string;
    department: string;
    position: string;
    otHours: number;
    otAmount: number;
    hasViolations: boolean;
  }>;
}

export function generateBODSummaryPDF(data: BODSummaryData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color scheme - Teal theme (matching payslip)
  const primaryColor: [number, number, number] = [47, 182, 201]; // #2FB6C9
  const blackColor: [number, number, number] = [34, 34, 34]; // #222
  const grayColor: [number, number, number] = [119, 119, 119]; // #777
  const borderColor: [number, number, number] = [230, 230, 230]; // #E6E6E6
  const lightTealBg: [number, number, number] = [232, 250, 251]; // #E8FAFB

  let yPos = 18; // 18mm top margin
  const leftMargin = 24; // 24mm left margin
  const rightMargin = 24; // 24mm right margin
  const pageWidth = 210;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // ===== HEADER SECTION (matching payslip) =====
  
  // Company logo placeholder (left side)
  const logoSize = 35; // 35mm x 35mm
  drawLogoPlaceholder(doc, leftMargin, yPos, logoSize, data.company.name);

  // Company info (right side)
  const companyInfoX = leftMargin + logoSize + 15;
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text(data.company.name, companyInfoX, yPos + 8);
  
  yPos += 13;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`(Registration No. ${data.company.registration_no})`, companyInfoX, yPos);
  
  yPos += 6;
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  const addressUpper = data.company.address.toUpperCase();
  doc.text(addressUpper, companyInfoX, yPos, { maxWidth: 100 });
  
  yPos += 10;
  doc.setFontSize(9);
  doc.text(`Telephone No. ${data.company.phone}`, companyInfoX, yPos);

  // ===== TITLE ROW (replaces employee name section) =====
  yPos = 75; // Fixed position after header
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  doc.text('OVERTIME SUMMARY REPORT', leftMargin, yPos);
  
  yPos += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('All Employees', leftMargin, yPos);

  // Period (right aligned)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Period: ', pageWidth - rightMargin - 45, yPos);
  doc.setTextColor(...blackColor);
  doc.text(data.period.display, pageWidth - rightMargin, yPos, { align: 'right' });

  // ===== SUMMARY STATISTICS BOXES (replaces NET PAY box) =====
  yPos += 10;
  const boxStartY = yPos;
  
  const boxWidth = 70;
  const boxHeight = 24;
  const boxGap = 8;
  
  // Left Box - Total Hours
  const hoursBoxX = leftMargin;
  doc.setFillColor(...lightTealBg);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.roundedRect(hoursBoxX, boxStartY, boxWidth, boxHeight, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL OT HOURS', hoursBoxX + boxWidth / 2, boxStartY + 9, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  const hoursText = `${data.statistics.totalHours.toFixed(1)} hrs`;
  doc.text(hoursText, hoursBoxX + boxWidth / 2, boxStartY + 18, { align: 'center' });
  
  // Right Box - Total Cost
  const costBoxX = hoursBoxX + boxWidth + boxGap;
  doc.setFillColor(...lightTealBg);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1.5);
  doc.roundedRect(costBoxX, boxStartY, boxWidth, boxHeight, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL OT COST', costBoxX + boxWidth / 2, boxStartY + 9, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...blackColor);
  const costText = `RM ${data.statistics.totalCost.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(costText, costBoxX + boxWidth / 2, boxStartY + 18, { align: 'center' });

  // Additional stats below boxes
  yPos = boxStartY + boxHeight + 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Total Employees: ${data.statistics.totalEmployees} | With Violations: ${data.statistics.withViolations}`, leftMargin, yPos);

  // ===== EMPLOYEE DATA SECTION =====
  yPos += 8;
  
  // Section title (matching payslip earnings section)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Employee Overtime Details', leftMargin, yPos);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`For Period ${data.period.display}`, pageWidth - rightMargin, yPos, { align: 'right' });
  
  yPos += 2;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, yPos, pageWidth - rightMargin, yPos);

  yPos += 5;

  // Employee table using autoTable
  const tableData = data.employees.map(emp => [
    emp.employeeNo,
    emp.name,
    emp.department,
    emp.position,
    `${emp.otHours.toFixed(1)} hrs`,
    `RM ${emp.otAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Employee No.', 'Name', 'Department', 'Position', 'OT Hours', 'OT Amount']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [34, 34, 34],
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [47, 182, 201],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { halign: 'right', cellWidth: 22 },
      5: { halign: 'right', cellWidth: 25 },
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { left: leftMargin, right: rightMargin },
  });

  // ===== FOOTER (matching payslip) =====
  const footerY = 280;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  const footerText = 'This is a computer-generated report.';
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

  // ===== SAVE PDF =====
  const fileName = `BOD_OT_Summary_${data.period.display.replace(' ', '_')}.pdf`;
  doc.save(fileName);
}

// Helper function to draw logo placeholder with company initials (matching payslip)
function drawLogoPlaceholder(
  doc: jsPDF, 
  x: number, 
  y: number, 
  size: number, 
  companyName: string
): void {
  // Draw circle
  doc.setFillColor(232, 250, 251); // Light teal background
  doc.setDrawColor(47, 182, 201); // Teal border
  doc.setLineWidth(0.5);
  doc.circle(x + size / 2, y + size / 2, size / 2, 'FD');

  // Get initials from company name
  const words = companyName.split(' ');
  const initials = words
    .filter(word => word.length > 0 && word !== '&')
    .slice(0, 3)
    .map(word => word[0].toUpperCase())
    .join('');

  // Draw initials
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(47, 182, 201); // Teal color
  doc.text(initials, x + size / 2, y + size / 2 + 2.5, { align: 'center' });
}
