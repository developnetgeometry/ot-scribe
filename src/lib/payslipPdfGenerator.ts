import jsPDF from 'jspdf';

export interface PayslipData {
  company: {
    name: string;
    registration_no: string;
    address: string;
    phone: string;
    logo_url: string | null;
  };
  employee: {
    employee_no: string;
    full_name: string;
    ic_no: string | null;
    department: string;
    position: string;
  };
  period: {
    display: string;
    month: number;
    year: number;
  };
  overtime: {
    amount: number;
    hours: number;
  };
}

export function generatePayslipPDF(data: PayslipData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Color scheme - Teal theme
  const primaryColor: [number, number, number] = [47, 182, 201]; // #2FB6C9
  const textColor: [number, number, number] = [34, 34, 34]; // #222
  const grayColor: [number, number, number] = [119, 119, 119]; // #777
  const borderColor: [number, number, number] = [230, 230, 230]; // #E6E6E6
  const lightTealBg: [number, number, number] = [232, 250, 251]; // #E8FAFB

  let yPos = 18; // 18mm top margin
  const leftMargin = 24; // 24mm left margin
  const rightMargin = 24; // 24mm right margin
  const pageWidth = 210;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // ===== HEADER SECTION =====
  
  // Company logo placeholder (left side)
  const logoSize = 40; // 40mm x 40mm
  
  if (data.company.logo_url) {
    // TODO: In a production app, you'd load the image from URL and embed it
    // For now, we'll draw a placeholder circle with initials
    drawLogoPlaceholder(doc, leftMargin, yPos, logoSize, data.company.name);
  } else {
    drawLogoPlaceholder(doc, leftMargin, yPos, logoSize, data.company.name);
  }

  // Company info (right side)
  const companyInfoX = leftMargin + logoSize + 15;
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(data.company.name, companyInfoX, yPos + 8);
  
  yPos += 14;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text(data.company.registration_no, companyInfoX, yPos);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.text(data.company.address, companyInfoX, yPos, { maxWidth: 100 });
  
  yPos += 6;
  doc.text(`Telephone No. ${data.company.phone}`, companyInfoX, yPos);

  // ===== EMPLOYEE SUMMARY ROW =====
  yPos = 75; // Fixed position after header
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(data.employee.full_name, leftMargin, yPos);
  
  yPos += 6;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`(Employee No: ${data.employee.employee_no})`, leftMargin, yPos);

  // Period (right aligned)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text(`Period: ${data.period.display}`, pageWidth - rightMargin, yPos - 6, { align: 'right' });

  // NET PAY box (right side)
  yPos += 8;
  const boxWidth = 60;
  const boxHeight = 22;
  const boxX = pageWidth - rightMargin - boxWidth;
  const boxY = yPos - 8;

  // Draw NET PAY box with teal border and light background
  doc.setFillColor(...lightTealBg);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'FD');

  // NET PAY label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('NET PAY', boxX + boxWidth / 2, boxY + 8, { align: 'center' });

  // Amount
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  const amountText = `RM ${data.overtime.amount.toFixed(2)}`;
  doc.text(amountText, boxX + boxWidth / 2, boxY + 16, { align: 'center' });

  // ===== EMPLOYEE DETAILS =====
  yPos += 2;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  doc.text(`Position: ${data.employee.position}`, leftMargin, yPos);
  yPos += 6;
  doc.text(`Dept: ${data.employee.department}`, leftMargin, yPos);
  yPos += 6;
  const icNo = data.employee.ic_no || 'Not Provided';
  doc.text(`IC/Passport: ${icNo}`, leftMargin, yPos);

  // ===== EARNINGS SECTION =====
  yPos += 15;
  
  // Section title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Employee Earnings/Reimbursements', leftMargin, yPos);
  
  yPos += 2;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, yPos, pageWidth - rightMargin, yPos);

  // Table content
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  // Overtime Pay row
  doc.text('Overtime Pay', leftMargin, yPos);
  doc.text(`RM ${data.overtime.amount.toFixed(2)}`, pageWidth - rightMargin, yPos, { align: 'right' });

  // ===== FOOTER =====
  const footerY = 280; // Fixed position near bottom
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  const footerText = 'This is a computer-generated payslip.';
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });

  // ===== SAVE PDF =====
  const fileName = `payslip_${data.employee.employee_no}_${data.period.display.replace(' ', '_')}.pdf`;
  doc.save(fileName);
}

// Helper function to draw logo placeholder with company initials
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
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(47, 182, 201); // Teal color
  doc.text(initials, x + size / 2, y + size / 2 + 3, { align: 'center' });
}
