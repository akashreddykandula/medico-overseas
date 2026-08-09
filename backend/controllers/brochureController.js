const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const Country = require("../models/Country");
const University = require("../models/University");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const BRAND_NAVY = "#1F3864";
const BRAND_CORAL = "#E15B3F";
const TEXT_DARK = "#2D3748";
const TEXT_MUTED = "#64748B";
const BG_LIGHT = "#F8FAFC";
const BORDER_COLOR = "#E2E8F0";

// Helper function to strip emojis and non-standard ASCII characters for PDFKit Helvetica
const cleanText = (str) => {
  if (!str) return "";
  return String(str)
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      "",
    )
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
};

const generateCountryBrochure = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Find destination
    const country = await Country.findOne({
      slug,
      isPublished: true,
    });

    if (!country) {
      throw new ApiError(404, "Destination not found");
    }

    // Sanitize country name for PDF headers & file name
    const cleanCountryName = cleanText(country.name) || country.name;

    // 2. Find all published universities for this destination
    const universities = await University.find({
      country: country._id,
      isPublished: true,
    })
      .sort({ name: 1 })
      .lean();

    // 3. Create PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
    });

    // 4. Safe downloadable file name
    const safeCountryName = cleanCountryName
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const fileName = `MBBS-in-${safeCountryName}-Brochure.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Pipe PDF directly to browser
    doc.pipe(res);
    doc.on("error", (error) => {
      console.error("PDF generation error:", error);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to generate brochure",
        });
      }
    });
    res.on("error", (error) => {
      console.error("Response error while generating PDF:", error);
    });

    // --------------------------------
    // PDF HEADER WITH LOGO
    // --------------------------------
    const logoPath =
      "/Volumes/WorkSpace/Local Disk-D/MERN/MERN_PROJECTS/medico-overseas/frontend/public/medicologo-removebg-preview.png";

    let headerTopY = 35;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, headerTopY, { width: 150 });
    } else {
      // Fallback stylized text logo if image file not resolved
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(BRAND_CORAL)
        .text("Medico ", 40, headerTopY, { continued: true })
        .fillColor(BRAND_NAVY)
        .text("Overseas");
    }

    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(BRAND_CORAL)
      .text("EXPERT MEDICAL COUNSELLING", 350, headerTopY + 5, {
        align: "right",
      })
      .font("Helvetica")
      .fillColor(TEXT_MUTED)
      .text("www.medicooverseas.com | +91 63018 78730", 350, headerTopY + 18, {
        align: "right",
      });

    // Decorative Header Divider
    doc
      .moveTo(40, headerTopY + 45)
      .lineTo(555, headerTopY + 45)
      .lineWidth(2)
      .strokeColor(BRAND_CORAL)
      .stroke();

    doc.y = headerTopY + 60;

    // Banner / Title Box
    const bannerY = doc.y;
    doc
      .roundedRect(40, bannerY, 515, 60, 8)
      .fillAndStroke(BRAND_NAVY, BRAND_NAVY);

    doc
      .fontSize(20)
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .text(`MBBS IN ${cleanCountryName.toUpperCase()}`, 50, bannerY + 12, {
        align: "center",
      });

    doc
      .fontSize(10)
      .fillColor("#E2E8F0")
      .font("Helvetica")
      .text(
        "Official Admission & University Guide for Indian Students",
        50,
        bannerY + 38,
        {
          align: "center",
        },
      );

    doc.y = bannerY + 75;

    // Overview
    addHeading(doc, `About ${cleanCountryName}`);

    doc
      .fontSize(9.5)
      .fillColor(TEXT_DARK)
      .font("Helvetica")
      .text(
        cleanText(
          country.overview || country.shortDescription || "Not specified",
        ),
        {
          lineGap: 3.5,
          align: "justify",
        },
      );

    doc.moveDown(0.8);

    // Quick Facts Section
    addHeading(doc, "Country Quick Facts");

    const facts = [
      { label: "Capital City", value: cleanText(country.capital) },
      { label: "Currency", value: cleanText(country.currency) },
      { label: "Flight Duration", value: cleanText(country.flightDuration) },
      { label: "Time Difference", value: cleanText(country.timeDifference) },
      {
        label: "International Airports",
        value: cleanText(country.internationalAirports),
      },
      {
        label: "Course Duration",
        value: `${country.durationYears || 6} Years`,
      },
      {
        label: "Medium of Instruction",
        value: cleanText(country.mediumOfInstruction) || "English",
      },
    ];

    renderGridCard(doc, facts);

    // Eligibility
    addHeading(doc, "Eligibility Criteria");

    addInfo(
      doc,
      "Minimum Age",
      country.eligibility?.minAge
        ? `${country.eligibility.minAge} Years`
        : "Not specified",
    );

    addInfo(
      doc,
      "NEET Requirement",
      country.eligibility?.neetRequired ? "Mandatory" : "Not Required",
    );

    addInfo(
      doc,
      "Minimum Academic Percentage",
      country.eligibility?.minAcademicPercent
        ? `${country.eligibility.minAcademicPercent}% (PCB)`
        : "Not specified",
    );

    if (country.eligibility?.notes) {
      doc.moveDown(0.3);
      doc
        .fontSize(9)
        .fillColor(TEXT_MUTED)
        .font("Helvetica-Oblique")
        .text(`Note: ${cleanText(country.eligibility.notes)}`);
    }

    // Country Fee Structure
    addHeading(doc, "Estimated Expense Breakdown");

    const annualTotal =
      (country.fees?.tuitionPerYear || 0) +
      (country.fees?.hostelPerYear || 0) +
      (country.fees?.messPerYear || 0);

    const feeBreakdown = [
      {
        label: "Tuition Fee / Year",
        value: formatMoney(
          country.fees?.currency,
          country.fees?.tuitionPerYear,
        ),
      },
      {
        label: "Hostel Fee / Year",
        value: formatMoney(country.fees?.currency, country.fees?.hostelPerYear),
      },
      {
        label: "Mess Fee / Year",
        value: formatMoney(country.fees?.currency, country.fees?.messPerYear),
      },
      {
        label: "One-Time Costs",
        value: formatMoney(country.fees?.currency, country.fees?.oneTimeCosts),
      },
      {
        label: "Estimated Annual Total",
        value: formatMoney(country.fees?.currency, annualTotal),
        highlight: true,
      },
    ];

    renderGridCard(doc, feeBreakdown);

    // Living Cost
    addHeading(doc, "Monthly Living Expenses");

    addInfo(
      doc,
      "Estimated Monthly Cost",
      formatMoney(
        country.livingCost?.currency,
        country.livingCost?.monthlyEstimate,
      ),
    );

    if (country.livingCost?.notes) {
      doc.moveDown(0.2);
      doc
        .fontSize(9)
        .fillColor(TEXT_MUTED)
        .text(cleanText(country.livingCost.notes));
    }

    // Universities
    addHeading(doc, `Medical Universities in ${cleanCountryName}`);

    if (universities.length === 0) {
      doc
        .fontSize(9.5)
        .fillColor(TEXT_MUTED)
        .text("No universities are currently listed.");
    }

    universities.forEach((university, index) => {
      if (doc.y > 640) {
        doc.addPage();
      }

      const cardStartY = doc.y;

      doc.rect(40, cardStartY, 4, 18).fill(BRAND_CORAL);

      doc
        .fontSize(12)
        .fillColor(BRAND_NAVY)
        .font("Helvetica-Bold")
        .text(
          `${index + 1}. ${cleanText(university.name)}`,
          50,
          cardStartY + 2,
        );

      doc.moveDown(0.5);

      addInfo(
        doc,
        "Tuition Fee / Year",
        formatMoney(university.fees?.currency, university.fees?.tuitionPerYear),
      );

      addInfo(
        doc,
        "Hostel Fee / Year",
        formatMoney(university.fees?.currency, university.fees?.hostelPerYear),
      );

      addInfo(
        doc,
        "Mess Fee / Year",
        formatMoney(university.fees?.currency, university.fees?.messPerYear),
      );

      addInfo(
        doc,
        "One-Time Costs",
        formatMoney(university.fees?.currency, university.fees?.oneTimeCosts),
      );

      addInfo(doc, "Course Duration", `${university.durationYears || 6} Years`);
      addInfo(
        doc,
        "Medium",
        cleanText(university.mediumOfInstruction) || "English",
      );
      addInfo(doc, "NMC Approved", university.nmcApproved ? "Yes" : "No");
      addInfo(doc, "WHO Recognized", university.whoRecognized ? "Yes" : "No");
      addInfo(
        doc,
        "Hostel Available",
        university.hostelAvailable ? "Yes" : "No",
      );

      if (university.description) {
        doc.moveDown(0.3);
        doc
          .fontSize(8.5)
          .fillColor(TEXT_MUTED)
          .font("Helvetica")
          .text(cleanText(university.description), { lineGap: 2.5 });
      }

      if (university.highlights?.length) {
        doc.moveDown(0.3);
        university.highlights.forEach((highlight) => {
          doc
            .fontSize(8.5)
            .fillColor(BRAND_CORAL)
            .text(`• `, { continued: true })
            .fillColor(TEXT_DARK)
            .text(cleanText(highlight));
        });
      }

      doc.moveDown(0.8);
    });

    // Admission Process
    if (country.admissionProcess?.length) {
      addHeading(doc, "Admission Process");

      country.admissionProcess.forEach((step, index) => {
        if (doc.y > 700) doc.addPage();

        doc
          .fontSize(9.5)
          .fillColor(BRAND_NAVY)
          .font("Helvetica-Bold")
          .text(`Step ${index + 1}: ${cleanText(step.step)}`);

        doc
          .fontSize(9)
          .fillColor(TEXT_DARK)
          .font("Helvetica")
          .text(cleanText(step.description) || "", { lineGap: 2 });

        doc.moveDown(0.4);
      });
    }

    // Visa
    if (country.visaProcess) {
      addHeading(doc, "Student Visa Process");

      doc
        .fontSize(9)
        .fillColor(TEXT_DARK)
        .text(cleanText(country.visaProcess), {
          lineGap: 3.5,
        });
    }

    // Required Documents
    if (country.requiredDocuments?.length) {
      addHeading(doc, "Required Documents");

      country.requiredDocuments.forEach((document) => {
        if (doc.y > 720) doc.addPage();
        doc
          .fontSize(9)
          .fillColor(BRAND_CORAL)
          .text("- ", { continued: true })
          .fillColor(TEXT_DARK)
          .text(cleanText(document));
      });
    }

    // Student Life
    if (country.studentLifeNotes) {
      addHeading(doc, "Student Life");

      doc
        .fontSize(9)
        .fillColor(TEXT_DARK)
        .text(cleanText(country.studentLifeNotes), {
          lineGap: 3.5,
        });
    }

    // Climate
    if (country.climateNotes) {
      addHeading(doc, "Climate & Seasons");

      doc
        .fontSize(9)
        .fillColor(TEXT_DARK)
        .text(cleanText(country.climateNotes), {
          lineGap: 3.5,
        });
    }

    // FAQs
    if (country.faqs?.length) {
      addHeading(doc, "Frequently Asked Questions");

      country.faqs.forEach((faq) => {
        if (doc.y > 680) doc.addPage();

        doc
          .fontSize(9.5)
          .fillColor(BRAND_NAVY)
          .font("Helvetica-Bold")
          .text(`Q: ${cleanText(faq.question)}`);

        doc
          .fontSize(9)
          .fillColor(TEXT_DARK)
          .font("Helvetica")
          .text(`A: ${cleanText(faq.answer)}`, { lineGap: 2 });

        doc.moveDown(0.5);
      });
    }

    // --------------------------------------------------
    // UNIVERSAL FOOTER AND PAGE NUMBERS
    // --------------------------------------------------
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      doc
        .moveTo(40, 780)
        .lineTo(555, 780)
        .lineWidth(0.5)
        .strokeColor(BORDER_COLOR)
        .stroke();

      doc
        .fontSize(8)
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .text("Medico Overseas — Official MBBS Destination Brochure", 40, 788)
        .text(`Page ${i + 1} of ${range.count}`, 40, 788, { align: "right" });
    }

    console.log("PDF generation completed for:", cleanCountryName);
    doc.end();
  } catch (error) {
    console.error("=================================");
    console.error("BROCHURE ERROR:");
    console.error(error);
    console.error("=================================");

    throw error;
  }
});

function addHeading(doc, title) {
  if (doc.y > 680) {
    doc.addPage();
  } else {
    doc.moveDown(0.6);
  }

  const startY = doc.y;

  doc
    .fontSize(13)
    .fillColor(BRAND_NAVY)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), 40, startY);

  doc.moveDown(0.3);

  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .lineWidth(1)
    .strokeColor(BRAND_CORAL)
    .stroke();

  doc.moveDown(0.5);
}

function addInfo(doc, label, value) {
  if (doc.y > 730) {
    doc.addPage();
  }

  doc
    .fontSize(9)
    .fillColor(BRAND_NAVY)
    .font("Helvetica-Bold")
    .text(`${label}: `, 45, doc.y, {
      continued: true,
    });

  doc
    .font("Helvetica")
    .fillColor(TEXT_DARK)
    .text(value || "Not specified");

  doc.moveDown(0.15);
}

function renderGridCard(doc, items) {
  if (doc.y > 640) doc.addPage();

  const startY = doc.y;
  const cardWidth = 515;
  const padding = 8;
  const rowHeight = 16;
  const cardHeight = items.length * rowHeight + padding * 2;

  doc
    .roundedRect(40, startY, cardWidth, cardHeight, 6)
    .fillAndStroke(BG_LIGHT, BORDER_COLOR);

  let currentY = startY + padding;

  items.forEach((item) => {
    const isHighlight = item.highlight;

    doc
      .fontSize(8.5)
      .fillColor(isHighlight ? BRAND_CORAL : TEXT_MUTED)
      .font(isHighlight ? "Helvetica-Bold" : "Helvetica")
      .text(item.label, 52, currentY);

    doc
      .fontSize(8.5)
      .fillColor(isHighlight ? BRAND_CORAL : BRAND_NAVY)
      .font(isHighlight ? "Helvetica-Bold" : "Helvetica-Bold")
      .text(item.value || "Not specified", 200, currentY, {
        width: 340,
        align: "right",
      });

    currentY += rowHeight;
  });

  doc.y = startY + cardHeight + 8;
}

function formatMoney(currency = "USD", amount = 0) {
  if (amount === undefined || amount === null) {
    return "Not specified";
  }

  return `${cleanText(currency) || "USD"} ${Number(amount).toLocaleString()}`;
}

module.exports = {
  generateCountryBrochure,
};
