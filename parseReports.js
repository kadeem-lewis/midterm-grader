const fs = require("fs");
const path = require("path");

// Get the repository name from the command-line arguments
const repoName = process.argv[2];

// Construct the paths to the JSON reports
const playwrightReportPath = path.join(
  "./",
  repoName,
  "report",
  "playwright.json"
);
const lighthouseReportPath = path.join(
  "./",
  repoName,
  "report",
  "lighthouse.report.json"
);

// Read the Playwright JSON report
const playwrightReport = JSON.parse(
  fs.readFileSync(playwrightReportPath, "utf8")
);

// Count the total number of tests and the number of passed tests
let totalTests = 0;
let passedTests = 0;
for (const suite of playwrightReport.suites) {
  for (const spec of suite.specs) {
    totalTests++;
    if (spec.tests[0].results[0].status === "passed") {
      passedTests++;
    }
  }
}

// Read the Lighthouse JSON report
const lighthouseReport = JSON.parse(
  fs.readFileSync(lighthouseReportPath, "utf8")
);

// Calculate the average Lighthouse score
let totalScore = 0;
let numCategories = 0;
for (const category of Object.values(lighthouseReport.categories)) {
  totalScore += category.score;
  numCategories++;
}
const averageScore = totalScore / numCategories;

const markdownResults = `
## Test Results for ${repoName.replace("midterm-portfolio-", "")}

### Playwright
- Total tests: ${totalTests}
- Passed tests: ${passedTests}

### LightHouse

- Performance score: ${Math.round(
  lighthouseReport.categories.performance.score * 100
)}
- Accessibility score: ${Math.round(
  lighthouseReport.categories.accessibility.score * 100
)}
- Best practices score: ${Math.round(
  lighthouseReport.categories["best-practices"].score * 100
)}
- SEO score: ${Math.round(lighthouseReport.categories.seo.score * 100)}
- Average Lighthouse score: ${Math.round(averageScore * 100)}
`;

fs.writeFileSync(
  path.join(repoName, "report", "test-results.md"),
  markdownResults
);
