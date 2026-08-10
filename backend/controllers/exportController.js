const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Lead = require("../models/Lead");
const asyncHandler = require("../utils/asyncHandler");

const MAX_EXPORT_ROWS = 500;

// ============================================================
// SECURITY HELPERS
// ============================================================

// Prevent spreadsheet formula injection when exported values
// begin with characters interpreted as formulas by Excel.
const safeExcelValue = (value) => {
  if (value === undefined || value === null) return "";

  const stringValue = String(value);

  if (/^[=+\-@]/.test(stringValue)) {
    return `'${stringValue}`;
  }

  return stringValue;
};

// Keep exported text bounded so unexpectedly large database
// values cannot create unnecessarily large files.
const cleanExportText = (value, maxLength = 1000) => {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(/\0/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, maxLength);
};

// ============================================================
// EXPORT LEADS AS EXCEL
// ============================================================

// @desc    Export leads as an Excel workbook
// @route   GET /api/admin/export/leads/excel
// @access  Private (admin/marketing_manager)
const exportLeadsExcel = asyncHandler(async (req, res) => {
  // SECURITY:
  // Limit the amount of data loaded into memory/exported.
  const leads = await Lead.find()
    .populate("interestedCountry", "name")
    .populate("assignedCounsellor", "name")
    .sort({ createdAt: -1 })
    .limit(MAX_EXPORT_ROWS)
    .lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads");

  sheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "City", key: "city", width: 18 },
    { header: "Interested Country", key: "country", width: 20 },
    { header: "NEET Score", key: "neetScore", width: 12 },
    { header: "Status", key: "status", width: 15 },
    { header: "Assigned Counsellor", key: "counsellor", width: 22 },
    { header: "Source", key: "source", width: 16 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };

  leads.forEach((lead) => {
    sheet.addRow({
      name: safeExcelValue(cleanExportText(lead.name, 200)),
      phone: safeExcelValue(cleanExportText(lead.phone, 50)),
      email: safeExcelValue(cleanExportText(lead.email, 254)),
      city: safeExcelValue(cleanExportText(lead.city, 100)),
      country: safeExcelValue(
        cleanExportText(lead.interestedCountry?.name, 150),
      ),
      neetScore:
        typeof lead.neetScore === "number" && Number.isFinite(lead.neetScore)
          ? lead.neetScore
          : "",
      status: safeExcelValue(cleanExportText(lead.status, 50)),
      counsellor: safeExcelValue(
        cleanExportText(lead.assignedCounsellor?.name || "Unassigned", 200),
      ),
      source: safeExcelValue(cleanExportText(lead.source, 50)),
      createdAt:
        lead.createdAt instanceof Date
          ? lead.createdAt.toISOString().split("T")[0]
          : "",
    });
  });

  // Prevent Excel from interpreting exported user-controlled
  // strings as formulas.
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.eachCell((cell) => {
      if (typeof cell.value === "string") {
        cell.value = safeExcelValue(cell.value);
      }
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="leads-export.xlsx"',
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");

  await workbook.xlsx.write(res);
  res.end();
});

// ============================================================
// EXPORT LEADS AS PDF
// ============================================================

// @desc    Export leads as a PDF report
// @route   GET /api/admin/export/leads/pdf
// @access  Private (admin/marketing_manager)
const exportLeadsPdf = asyncHandler(async (req, res) => {
  // SECURITY:
  // Keep the existing report cap and explicitly bound the query.
  const leads = await Lead.find()
    .populate("interestedCountry", "name")
    .sort({ createdAt: -1 })
    .limit(MAX_EXPORT_ROWS)
    .lean();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="leads-report.pdf"',
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");

  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
    layout: "landscape",
  });

  doc.pipe(res);

  doc.fontSize(18).fillColor("#1F3864").text("Medico Overseas — Leads Report", {
    align: "center",
  });

  doc.moveDown();

  doc.fontSize(10).fillColor("black");

  leads.forEach((lead, index) => {
    const name = cleanExportText(lead.name, 200) || "—";
    const phone = cleanExportText(lead.phone, 50) || "—";
    const email = cleanExportText(lead.email, 254) || "—";
    const country = cleanExportText(lead.interestedCountry?.name, 150) || "—";
    const status = cleanExportText(lead.status, 50) || "—";

    doc.text(
      `${index + 1}. ${name} | ${phone} | ${email} | ${country} | Status: ${status}`,
    );
  });

  doc.end();
});

module.exports = {
  exportLeadsExcel,
  exportLeadsPdf,
};
