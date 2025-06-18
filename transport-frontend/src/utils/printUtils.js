// src/utils/printUtils.js

const SCHOOL_LOGO_URL = "/logo-rmbg.png";
const SCHOOL_NAME = "Westside Educational Complex";
const SYSTEM_NAME = "Transport Fees Management System";

function formatPrintedOnDate() {
  const now = new Date();
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return now.toLocaleString("en-US", options);
}

export function printTableWithHeader({ title, summary, columns, rows }) {
  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this site.");
    return;
  }

  const printedOn = formatPrintedOnDate();
  const sourceURL = window.location.href;

  const tableHeader = columns.map((col) => `<th>${col.label}</th>`).join("");

  const tableBody = rows
    .map(
      (row) => `
        <tr>
          ${columns.map((col) => `<td>${row[col.key] ?? ""}</td>`).join("")}
        </tr>`
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: "Segoe UI", sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header img {
            height: 80px;
            margin-bottom: 10px;
          }
          .system-name {
            font-size: 20px;
            font-weight: bold;
          }
          .print-title {
            font-size: 24px;
            margin-top: 10px;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .summary {
            text-align: center;
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 600;
            color: #444;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 10px 8px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: 600;
          }
          .print-footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: right;
          }
          .source-url {
            font-size: 12px;
            color: #777;
            text-align: right;
            margin-top: 5px;
          }
          @media print {
            body {
              zoom: 85%;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${SCHOOL_LOGO_URL}" alt="School Logo" />
          <h1>${SCHOOL_NAME}</h1>
          <div class="system-name">${SYSTEM_NAME}</div>
          <div class="print-title">${title}</div>
          ${summary ? `<div class="summary">${summary}</div>` : ""}
        </div>
        <table>
          <thead>
            <tr>${tableHeader}</tr>
          </thead>
          <tbody>
            ${tableBody}
          </tbody>
        </table>
        <div class="print-footer">
          Printed on: ${printedOn}
        </div>
        <div class="source-url">
          ${sourceURL}
        </div>
        <script>
          window.onload = function () {
            window.print();
            window.onafterprint = function () {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
