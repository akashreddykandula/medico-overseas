const PDFDocument = require("pdfkit");
const Country = require("../models/Country");
const University = require("../models/University");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// ============================================================
// BRAND / PDF CONSTANTS
// ============================================================

const BRAND_NAVY = "#1F3864";
const BRAND_CORAL = "#E15B3F";
const TEXT_DARK = "#2D3748";
const TEXT_MUTED = "#64748B";
const BG_LIGHT = "#F8FAFC";
const BORDER_COLOR = "#E2E8F0";

// ============================================================
// SECURITY HELPERS
// ============================================================

// Keep PDF text bounded so unexpectedly large database values
// cannot cause excessive PDF generation/memory usage.
const cleanText = (value, maxLength = 10000) => {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      "",
    )
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, maxLength);
};

// Only allow a normal URL slug.
// This prevents malformed values/operators from being used in
// the MongoDB query.
const sanitizeSlug = (value) => {
  if (typeof value !== "string") return "";

  const slug = value.trim().toLowerCase();

  if (!slug || slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "";
  }

  return slug;
};

// Build a safe filename for Content-Disposition.
// Never place the raw country name directly into a response header.
const buildSafeFileName = (countryName) => {
  const safeName = cleanText(countryName, 100)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `MBBS-in-${safeName || "Destination"}-Brochure.pdf`;
};

// ============================================================
// GENERATE COUNTRY BROCHURE
//
// @route   GET /api/countries/:slug/brochure
// @access  Public
//
// SECURITY:
// - Slug is validated before database access.
// - Only published countries are exposed.
// - Only published universities are included.
// - Database queries use fixed projections/queries.
// - PDF content is bounded before rendering.
// - Download filename is sanitized.
// - No user-controlled filesystem path is used.
// ============================================================

const generateCountryBrochure = asyncHandler(async (req, res) => {
  const slug = sanitizeSlug(req.params.slug);

  if (!slug) {
    throw new ApiError(400, "Invalid destination slug");
  }

  // ----------------------------------------------------------
  // Find only a published destination.
  // ----------------------------------------------------------

  const country = await Country.findOne({
    slug,
    isPublished: true,
  }).lean();

  if (!country) {
    throw new ApiError(404, "Destination not found");
  }

  const cleanCountryName = cleanText(country.name, 150) || "Destination";

  // ----------------------------------------------------------
  // Fetch only published universities for this destination.
  // ----------------------------------------------------------

  const universities = await University.find({
    country: country._id,
    isPublished: true,
  })
    .sort({ name: 1 })
    .lean();

  // ----------------------------------------------------------
  // Create PDF.
  //
  // bufferPages is required because the footer/page-number
  // section is added after the document content is generated.
  // ----------------------------------------------------------

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
  });

  const fileName = buildSafeFileName(cleanCountryName);

  // ----------------------------------------------------------
  // Response headers.
  //
  // fileName is generated only from sanitized content.
  // ----------------------------------------------------------

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");

  // Pipe PDF directly to the HTTP response.
  doc.pipe(res);

  // ----------------------------------------------------------
  // PDF error handling.
  //
  // Once PDF streaming has started, headers may already have
  // been sent. Therefore do not attempt to send JSON after that.
  // ----------------------------------------------------------

  doc.on("error", (error) => {
    console.error("PDF generation error:", error);

    // The stream may already be in progress. Destroying the
    // response prevents a partially generated PDF from remaining
    // open indefinitely.
    if (!res.destroyed) {
      res.destroy(error);
    }
  });

  res.on("error", (error) => {
    console.error("Response error while generating PDF:", error);
  });

  // ==========================================================
  // PDF HEADER
  // ==========================================================

  // ----------------------------------------------------------
  // IMPORTANT:
  // The previous absolute local filesystem path has been removed.
  //
  // If you want a logo in the generated PDF, set:
  //
  // BROCHURE_LOGO_PATH=/absolute/path/to/logo.png
  //
  // in the BACKEND .env.
  //
  // Never hard-code a developer-specific local path.
  // ----------------------------------------------------------

  const fs = require("fs");

  const logoPath =
    typeof process.env.BROCHURE_LOGO_PATH === "string"
      ? process.env.BROCHURE_LOGO_PATH.trim()
      : "";

  let headerTopY = 35;

  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, headerTopY, {
      width: 150,
    });
  } else {
    // Safe text fallback when the configured logo is unavailable.
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor(BRAND_CORAL)
      .text("Medico ", 40, headerTopY, {
        continued: true,
      })
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

  doc
    .moveTo(40, headerTopY + 45)
    .lineTo(555, headerTopY + 45)
    .lineWidth(2)
    .strokeColor(BRAND_CORAL)
    .stroke();

  doc.y = headerTopY + 60;

  // ==========================================================
  // TITLE BANNER
  // ==========================================================

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

  // ==========================================================
  // OVERVIEW
  // ==========================================================

  addHeading(doc, `About ${cleanCountryName}`);

  doc
    .fontSize(9.5)
    .fillColor(TEXT_DARK)
    .font("Helvetica")
    .text(
      cleanText(
        country.overview || country.shortDescription || "Not specified",
        12000,
      ),
      {
        lineGap: 3.5,
        align: "justify",
      },
    );

  doc.moveDown(0.8);

  // ==========================================================
  // QUICK FACTS
  // ==========================================================

  addHeading(doc, "Country Quick Facts");

  const facts = [
    {
      label: "Capital City",
      value: cleanText(country.capital),
    },
    {
      label: "Currency",
      value: cleanText(country.currency),
    },
    {
      label: "Flight Duration",
      value: cleanText(country.flightDuration),
    },
    {
      label: "Time Difference",
      value: cleanText(country.timeDifference),
    },
    {
      label: "International Airports",
      value: cleanText(country.internationalAirports),
    },
    {
      label: "Course Duration",
      value: `${Number(country.durationYears) || 6} Years`,
    },
    {
      label: "Medium of Instruction",
      value: cleanText(country.mediumOfInstruction, 100) || "English",
    },
  ];

  renderGridCard(doc, facts);

  // ==========================================================
  // ELIGIBILITY
  // ==========================================================

  addHeading(doc, "Eligibility Criteria");

  addInfo(
    doc,
    "Minimum Age",
    country.eligibility?.minAge
      ? `${Number(country.eligibility.minAge)} Years`
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
      ? `${Number(country.eligibility.minAcademicPercent)}% (PCB)`
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

  // ==========================================================
  // COUNTRY FEE STRUCTURE
  // ==========================================================

  addHeading(doc, "Estimated Expense Breakdown");

  const tuition = Number(country.fees?.tuitionPerYear) || 0;
  const hostel = Number(country.fees?.hostelPerYear) || 0;
  const mess = Number(country.fees?.messPerYear) || 0;

  const annualTotal = tuition + hostel + mess;

  const feeBreakdown = [
    {
      label: "Tuition Fee / Year",
      value: formatMoney(country.fees?.currency, country.fees?.tuitionPerYear),
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

  // ==========================================================
  // LIVING COST
  // ==========================================================

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

  // ==========================================================
  // UNIVERSITIES
  // ==========================================================

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
        `${index + 1}. ${cleanText(university.name, 200)}`,
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

    addInfo(
      doc,
      "Course Duration",
      `${Number(university.durationYears) || 6} Years`,
    );

    addInfo(
      doc,
      "Medium",
      cleanText(university.mediumOfInstruction, 100) || "English",
    );

    addInfo(doc, "NMC Approved", university.nmcApproved ? "Yes" : "No");

    addInfo(doc, "WHO Recognized", university.whoRecognized ? "Yes" : "No");

    addInfo(doc, "Hostel Available", university.hostelAvailable ? "Yes" : "No");

    if (university.description) {
      doc.moveDown(0.3);

      doc
        .fontSize(8.5)
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .text(cleanText(university.description, 6000), {
          lineGap: 2.5,
        });
    }

    if (Array.isArray(university.highlights) && university.highlights.length) {
      doc.moveDown(0.3);

      // Bound the number of rendered highlights so malformed data
      // cannot create an unnecessarily large PDF.
      university.highlights.slice(0, 50).forEach((highlight) => {
        doc
          .fontSize(8.5)
          .fillColor(BRAND_CORAL)
          .text("• ", {
            continued: true,
          })
          .fillColor(TEXT_DARK)
          .text(cleanText(highlight, 500));
      });
    }

    doc.moveDown(0.8);
  });

  // ==========================================================
  // ADMISSION PROCESS
  // ==========================================================

  if (
    Array.isArray(country.admissionProcess) &&
    country.admissionProcess.length
  ) {
    addHeading(doc, "Admission Process");

    country.admissionProcess.slice(0, 50).forEach((step, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      doc
        .fontSize(9.5)
        .fillColor(BRAND_NAVY)
        .font("Helvetica-Bold")
        .text(`Step ${index + 1}: ${cleanText(step.step, 500)}`);

      doc
        .fontSize(9)
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .text(cleanText(step.description, 3000) || "", {
          lineGap: 2,
        });

      doc.moveDown(0.4);
    });
  }

  // ==========================================================
  // VISA
  // ==========================================================

  if (country.visaProcess) {
    addHeading(doc, "Student Visa Process");

    doc
      .fontSize(9)
      .fillColor(TEXT_DARK)
      .text(cleanText(country.visaProcess, 8000), {
        lineGap: 3.5,
      });
  }

  // ==========================================================
  // REQUIRED DOCUMENTS
  // ==========================================================

  if (
    Array.isArray(country.requiredDocuments) &&
    country.requiredDocuments.length
  ) {
    addHeading(doc, "Required Documents");

    country.requiredDocuments.slice(0, 100).forEach((document) => {
      if (doc.y > 720) {
        doc.addPage();
      }

      doc
        .fontSize(9)
        .fillColor(BRAND_CORAL)
        .text("- ", {
          continued: true,
        })
        .fillColor(TEXT_DARK)
        .text(cleanText(document, 500));
    });
  }

  // ==========================================================
  // STUDENT LIFE
  // ==========================================================

  if (country.studentLifeNotes) {
    addHeading(doc, "Student Life");

    doc
      .fontSize(9)
      .fillColor(TEXT_DARK)
      .text(cleanText(country.studentLifeNotes, 8000), {
        lineGap: 3.5,
      });
  }

  // ==========================================================
  // CLIMATE
  // ==========================================================

  if (country.climateNotes) {
    addHeading(doc, "Climate & Seasons");

    doc
      .fontSize(9)
      .fillColor(TEXT_DARK)
      .text(cleanText(country.climateNotes, 8000), {
        lineGap: 3.5,
      });
  }

  // ==========================================================
  // FAQ
  // ==========================================================

  if (Array.isArray(country.faqs) && country.faqs.length) {
    addHeading(doc, "Frequently Asked Questions");

    country.faqs.slice(0, 100).forEach((faq) => {
      if (doc.y > 680) {
        doc.addPage();
      }

      doc
        .fontSize(9.5)
        .fillColor(BRAND_NAVY)
        .font("Helvetica-Bold")
        .text(`Q: ${cleanText(faq.question, 1000)}`);

      doc
        .fontSize(9)
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .text(`A: ${cleanText(faq.answer, 3000)}`, {
          lineGap: 2,
        });

      doc.moveDown(0.5);
    });
  }

  // ==========================================================
  // FOOTER / PAGE NUMBERS
  // ==========================================================

  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i += 1) {
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
      .text(`Page ${i + 1} of ${range.count}`, 40, 788, {
        align: "right",
      });
  }

  console.log("PDF generation completed for:", cleanCountryName);

  // Finalize the PDF stream.
  doc.end();
});

// ============================================================
// PDF HELPERS
// ============================================================

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
    .text(cleanText(title, 300).toUpperCase(), 40, startY);

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
    .text(`${cleanText(label, 200)}: `, 45, doc.y, {
      continued: true,
    });

  doc
    .font("Helvetica")
    .fillColor(TEXT_DARK)
    .text(cleanText(value, 1000) || "Not specified");

  doc.moveDown(0.15);
}

function renderGridCard(doc, items) {
  if (doc.y > 640) {
    doc.addPage();
  }

  const startY = doc.y;
  const cardWidth = 515;
  const padding = 8;
  const rowHeight = 16;

  // Limit rendered rows as a defensive measure.
  const safeItems = Array.isArray(items) ? items.slice(0, 50) : [];

  const cardHeight = safeItems.length * rowHeight + padding * 2;

  doc
    .roundedRect(40, startY, cardWidth, cardHeight, 6)
    .fillAndStroke(BG_LIGHT, BORDER_COLOR);

  let currentY = startY + padding;

  safeItems.forEach((item) => {
    const isHighlight = Boolean(item.highlight);

    doc
      .fontSize(8.5)
      .fillColor(isHighlight ? BRAND_CORAL : TEXT_MUTED)
      .font(isHighlight ? "Helvetica-Bold" : "Helvetica")
      .text(cleanText(item.label, 200), 52, currentY);

    doc
      .fontSize(8.5)
      .fillColor(isHighlight ? BRAND_CORAL : BRAND_NAVY)
      .font(isHighlight ? "Helvetica-Bold" : "Helvetica-Bold")
      .text(cleanText(item.value, 500) || "Not specified", 200, currentY, {
        width: 340,
        align: "right",
      });

    currentY += rowHeight;
  });

  doc.y = startY + cardHeight + 8;
}

function formatMoney(currency = "USD", amount = 0) {
  const numericAmount = Number(amount);

  if (
    amount === undefined ||
    amount === null ||
    !Number.isFinite(numericAmount)
  ) {
    return "Not specified";
  }

  const safeCurrency = cleanText(currency, 10).toUpperCase() || "USD";

  return `${safeCurrency} ${numericAmount.toLocaleString()}`;
}

module.exports = {
  generateCountryBrochure,
};
