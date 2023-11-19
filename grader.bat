@echo off
SET repo_link=%1
FOR /F "tokens=1* delims=/" %%A IN ("%repo_link%") DO (
    FOR /F "tokens=1* delims=." %%C IN ("%%B") DO (
        SET repo_name=%%C
    )
)

git clone %repo_link%
cd %repo_name%

call npm install
call npm install -D @playwright/test@latest lighthouse@latest
call npx playwright install

set PORT=3000

echo "Starting server with node index.js"
start node index.js

start http://localhost:%PORT%

mkdir report
:: runs playwright tests using choromium and generates reports
set PLAYWRIGHT_JSON_OUTPUT_NAME=report/playwright.json
set PLAYWRIGHT_HTML_REPORT=report/playwright
::prevents the html report from opening in the browser if a test fails
set PW_TEST_HTML_REPORT_OPEN=never
start /wait cmd /c "npx playwright test --project=chromium --reporter=json,html"

:: runs lighthouse tests for the specified categories and generates reports
start /wait cmd /c npx lighthouse http://localhost:%PORT% -y --output=json --output=html --output-path=./report/lighthouse --only-categories=accessibility, best-practices, performance, seo chrome-flags="--headless"

echo "Parsing reports..."
cd ..
node parseReports.js %repo_name%
