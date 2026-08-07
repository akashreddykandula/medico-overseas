const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Lead = require('../models/Lead');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Export leads as an Excel workbook
// @route   GET /api/admin/export/leads/excel
// @access  Private (admin/marketing_manager)
const exportLeadsExcel = asyncHandler(async (req, res) => {
  const leads = await Lead.find().populate('interestedCountry', 'name').populate('assignedCounsellor', 'name');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Leads');

  sheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'City', key: 'city', width: 18 },
    { header: 'Interested Country', key: 'country', width: 20 },
    { header: 'NEET Score', key: 'neetScore', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Assigned Counsellor', key: 'counsellor', width: 22 },
    { header: 'Source', key: 'source', width: 16 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };

  leads.forEach((lead) => {
    sheet.addRow({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      city: lead.city || '',
      country: lead.interestedCountry?.name || '',
      neetScore: lead.neetScore || '',
      status: lead.status,
      counsellor: lead.assignedCounsellor?.name || 'Unassigned',
      source: lead.source,
      createdAt: lead.createdAt.toISOString().split('T')[0],
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=leads-export.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export leads as a PDF report
// @route   GET /api/admin/export/leads/pdf
// @access  Private (admin/marketing_manager)
const exportLeadsPdf = asyncHandler(async (req, res) => {
  const leads = await Lead.find().populate('interestedCountry', 'name').limit(500); // cap for a readable report

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=leads-report.pdf');

  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(18).fillColor('#1F3864').text('Medico Overseas — Leads Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('black');

  leads.forEach((lead, i) => {
    doc.text(
      `${i + 1}. ${lead.name} | ${lead.phone} | ${lead.email || '—'} | ${lead.interestedCountry?.name || '—'} | Status: ${lead.status}`
    );
  });

  doc.end();
});

module.exports = { exportLeadsExcel, exportLeadsPdf };
