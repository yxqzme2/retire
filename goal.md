Build me a self-hosted retirement planning dashboard as a containerized web app for Unraid. This is version 1, but it must be built cleanly so I can expand it later.

The goal is not a generic retirement calculator. The goal is an interactive retirement decision dashboard that lets me plug in assumptions, compare scenarios, and see if I am on track. I want something I can revisit and edit over time. I want it to feel like a polished dashboard, not a plain spreadsheet.

## Product goal

Create a local-first retirement planning web app that:

* runs in Docker on Unraid
* has a clean web dashboard UI
* stores my data so I do not lose it between sessions
* supports multiple scenarios
* allows lots of editable assumptions and sliders
* can import seed/default data from a spreadsheet or CSV files for version 1
* does all calculations in the app, not in Excel formulas
* is designed so that later I can move fully away from spreadsheets and use a database/admin UI only

This is an MVP, but it should be architected well. Do not build a throwaway toy.

## High-level product decisions

For version 1:

* Use a spreadsheet/CSV import only as a convenient data source and editing method
* Do not make the spreadsheet the calculation engine
* The app itself should perform all calculations
* Persist everything in a local database
* Allow editing inside the UI too, not just by spreadsheet
* Support importing updated CSV/spreadsheet data later if I want
* Make all assumptions clearly visible and editable

## Preferred stack

Use a practical self-hosted stack that runs well in Docker and is easy to maintain.

Recommended:

* Frontend: React + TypeScript + Vite
* UI: clean dashboard design with cards, charts, sliders, tables, and tabs
* Backend: FastAPI or Node/Express if you strongly prefer one, but choose one and keep it clean
* Database: SQLite for MVP
* Charts: Recharts, Chart.js, or another solid React chart library
* Styling: Tailwind CSS
* Containerization: Docker with docker-compose support
* Data import: CSV import first, with architecture that can later support Excel/xlsx import
* Settings/config: environment variables where appropriate

If you think a different stack is clearly better for this use case, use it, but keep it simple, self-hosted, and maintainable.

## Core concept

The app must answer this question:

For each year from now until a chosen end age, where does the money come from, what taxes hit it, what gets withdrawn from which accounts, what is left at year end, and do I run short?

The app should project year-by-year retirement outcomes across multiple account types and tax treatments.

## Primary UX

I want the UI to feel like a decision dashboard. It should not feel like tax software.

The main experience should include:

* a dashboard homepage with summary cards
* scenario comparison cards
* clear assumption controls
* charts that update when assumptions change
* the ability to save scenarios
* the ability to duplicate a scenario and tweak it
* a way to compare scenarios side by side

The app should look polished and clean. Think modern personal finance dashboard, not enterprise accounting software.

## Information architecture

Design the app with these main sections:

1. Dashboard
2. Profile / timeline
3. Accounts
4. Income streams
5. Expenses
6. Assumptions
7. Scenarios
8. Results / projections
9. Import / export
10. Settings / admin

## MVP data model

Design a real schema and persist it in SQLite.

At minimum include entities like:

* User or Profile
* Scenario
* Account
* IncomeStream
* ExpenseItem
* OneTimeEvent
* AssumptionSet
* ProjectionResult
* TaxSettings
* ImportHistory

### Profile fields

Include:

* current age
* spouse age if enabled
* retirement age
* spouse retirement age
* projection end age
* filing status
* retirement state
* inflation assumption
* healthcare inflation assumption
* longevity assumption
* notes

### Account fields

Support multiple accounts with separate tax treatment.

Account types:

* 401k / traditional pre-tax
* Roth IRA
* taxable brokerage
* dividend portfolio
* cash / HYSA
* pension
* Social Security
* HSA if included
* other custom account

For each account, include:

* name
* type
* current balance
* annual contribution
* employer match if relevant
* expected annual return
* dividend yield
* contribution stop age
* withdrawal priority
* taxable / tax-deferred / tax-free classification
* include in projection toggle
* notes

### Income stream fields

Include:

* name
* type
* start age
* end age if applicable
* monthly or annual amount
* cola / growth rate
* taxable yes/no
* partially taxable yes/no
* notes

Examples:

* pension
* Social Security
* part-time retirement work
* rental income
* annuity
* other income

### Expense fields

Use three categories:

* core recurring expenses
* flexible spending
* irregular / periodic expenses

Each expense item should include:

* name
* category
* amount
* monthly or annual
* start age
* end age
* inflation linked yes/no
* custom inflation rate optional
* essential vs optional flag
* notes

### One-time event fields

Include:

* name
* year or age
* amount
* inflow or outflow
* description

Examples:

* home paid off
* new car
* roof replacement
* downsizing proceeds
* inheritance
* helping children
* medical event

### Assumption fields

Include:

* baseline portfolio return
* conservative return
* aggressive return
* inflation
* healthcare inflation
* dividend tax treatment
* long-term capital gains assumption
* federal tax assumption
* state tax assumption
* Social Security taxation assumption
* RMD enabled toggle
* Roth conversion enabled toggle
* retirement spending reduction after certain age toggle
* medical spending increase after certain age toggle
* bear market stress test toggle
* sequence of returns stress test toggle

## Spreadsheet / CSV import

For MVP, support import of CSV files. Architect it so that xlsx can be added later.

Create an import flow that can load seed data from separate CSV files such as:

* profile.csv
* accounts.csv
* income_streams.csv
* expenses.csv
* one_time_events.csv
* assumptions.csv
* scenarios.csv

Requirements:

* validate the CSV structure
* show import errors clearly
* preview imported data before saving
* allow overwrite or merge behavior
* record import history
* provide downloadable sample CSV templates

The spreadsheet/CSV is not the source of truth after import. The database is.

## Calculation engine requirements

All projections must be calculated inside the app.

Do not depend on spreadsheet formulas.

Create a clear calculation engine with readable code and separation from the UI.

### Projection logic

Run year-by-year projections from current age to end age.

For each year:

* grow account balances by expected return
* apply contributions if pre-retirement
* add income streams that are active
* inflate expenses as configured
* apply one-time events when applicable
* calculate gross spending need
* determine available cash flow from income
* determine withdrawal need from investment accounts
* calculate taxes
* calculate net available income
* update account balances after withdrawals
* store results for that year

### Withdrawal strategy

Support configurable withdrawal strategies:

* taxable first, then pre-tax, then Roth
* pre-tax first, then taxable, then Roth
* dividends first, then taxable, then pre-tax, then Roth
* custom priority based on account field
* allow later expansion for tax-bracket-aware withdrawal logic

For MVP, implement the first four well.

### Taxes

Do not try to reproduce every edge case of the tax code. But do not ignore taxes.

MVP tax engine should support:

* taxable ordinary income
* tax-free Roth withdrawals
* taxable pension income
* qualified dividend income assumption
* taxable brokerage withdrawals with a reasonable capital gains simplification
* state tax rate
* federal tax rate approximation
* Social Security taxation approximation
* after-tax cash flow calculation

Keep the tax system modular so it can be improved later.

### Spending logic

Support:

* spending in today’s dollars
* inflation adjustments
* healthcare inflation override
* expense start and stop ages
* optional spending cuts after a defined age
* increased medical costs after a defined age

### Stress testing

Include toggles or scenario presets for:

* early bad market returns
* lower long-term returns
* higher inflation
* higher healthcare costs
* early retirement
* delayed Social Security
* extra travel spending
* downsizing event
* part-time income in first retirement years

## Outputs and charts

The UI should provide useful outputs, not just raw numbers.

### Summary cards

Include:

* estimated portfolio at retirement
* estimated after-tax monthly retirement income
* projected monthly spending target
* projected surplus or gap
* first shortfall year
* portfolio survival age
* total tax drag over projection
* scenario status: on track / borderline / off track

### Charts

Build these charts:

1. Account balances over time

* line chart with one line per account or account category

2. Income vs expenses by year

* stacked bars for pension, Social Security, dividends, withdrawals
* line overlay or stacked visual for spending and taxes

3. Withdrawal source mix

* stacked bar or area chart showing where retirement cash came from each year

4. Taxes by year

* annual tax amount over time

5. Net worth over time

* line chart

6. Bubble chart
   I want a neat bubble chart inspired by my existing housing dashboard style.
   Use one of these concepts:

* bubble size = account balance
* x-axis = tax efficiency score
* y-axis = liquidity/accessibility
* color = account type

Or, if that is not visually helpful:

* bubble size = annual expense category size
* x-axis = fixed vs flexible
* y-axis = inflation sensitivity
* color = category

Pick the version that is most useful and visually strong, but include a bubble chart.

### Scenario comparison

Create scenario cards and comparison view for:

* base case
* conservative
* aggressive
* retire at 60
* retire at 62
* retire at 65
* crash early
* high medical costs
* lower spending
* travel-heavy retirement

Let users duplicate any scenario and edit it.

## UX behavior

I want this to be interactive and pleasant to use.

Requirements:

* sliders for major assumptions where helpful
* numeric input boxes too, for precise editing
* toggles for scenario behaviors
* tabs or accordions for sections
* save scenario button
* duplicate scenario button
* reset scenario to baseline button
* responsive layout for desktop
* dark mode support is nice if easy
* clean labels and tooltips
* no cluttered finance jargon

## Editing experience

I want multiple ways to maintain data.

Support:

* direct UI editing in tables/forms
* CSV import for bulk updates
* CSV export for backup
* scenario duplication
* ability to edit assumptions without re-importing data

Eventually this may become a fuller database app, so structure it with that in mind.

## Persistence and self-hosting

This must run well as a Docker container on Unraid.

Requirements:

* persistent storage volume for SQLite database
* persistent storage for uploaded CSV templates/imports if needed
* .env support
* documented docker run example
* documented docker-compose example
* clear README for Unraid deployment
* simple startup process

Provide:

* Dockerfile
* docker-compose.yml
* sample .env.example
* clear instructions for volume mapping
* instructions for backup of the SQLite DB

## Admin and safety features

Include:

* import validation
* graceful handling of bad input
* confirmation before destructive overwrite
* audit trail or at least import history
* clear empty states
* seed/sample demo data for testing
* no authentication required for MVP if that simplifies deployment, but structure it so auth can be added later

## Code quality requirements

I care about clean architecture.

Please:

* separate frontend, backend, and calculation engine clearly
* write readable code
* use TypeScript types or strong typing where possible
* avoid giant unstructured files
* keep business logic out of UI components
* make the projection engine testable
* include basic tests for projection math and import validation
* include comments where they actually help
* no fake placeholder calculations

## What not to do

* Do not make Excel the calculation engine
* Do not hardcode all values into the frontend
* Do not make this depend on external APIs
* Do not build an overcomplicated tax simulator for v1
* Do not make it ugly and spreadsheet-like
* Do not skip taxes entirely
* Do not skip scenario saving
* Do not skip persistence

## Deliverables

Build the project and provide:

1. Full project structure
2. Backend code
3. Frontend code
4. Database schema/migrations
5. Calculation engine
6. CSV import/export system
7. Seed/sample data
8. Docker files
9. README with setup steps
10. Notes on where to extend next

## Nice-to-have features if time allows

* Monte Carlo style simulation later, but not required for MVP
* Roth conversion sandbox later
* RMD-specific views later
* Medicare/IRMAA thresholds later
* spouse-specific scenario logic later
* print/export summary report later

## Final guidance

Make practical choices. If something here is too much for v1, keep the architecture ready for it but implement the strongest MVP possible first.

The MVP should already be useful for a real person planning retirement, with multiple account types, taxes, scenarios, projections, persistence, import/export, and charts.

I want a working self-hosted dashboard app, not just wireframes.

Also provide a short explanation of your implementation choices before the code, especially:

* why you chose the stack
* how the data model works
* how the projection engine works
* how to run it on Unraid
