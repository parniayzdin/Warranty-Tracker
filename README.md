<h1>
  Warranty Tracker
  <img src="docs/warranty-tracker-logo.png" alt="Warranty Tracker logo" width="200" align="right">
</h1>

## About

Warranty Tracker is a full stack home asset management project inspired by how difficult it can be to keep track of everything you own once warranties, receipts, maintenance, and recall information start piling up. After seeing how scattered and inconvenient that process can be, I wanted to build one place where each asset can have its warranty details, maintenance history, receipts, recalls, replacement parts, and reminders organized together.

<h2>
  <img src="docs/stickers/bear.svg" alt="Bear sticker" width="68" align="left">
  What it tracks
</h2>

**Assets**  Appliances, electronics, vehicles, baby products, and home equipment

**Warranties**  Providers, coverage dates, status, and receipts

**Maintenance**  Upcoming tasks, last completion date, and recurring care schedules

**Recalls and parts**  Product recall information and useful replacement part links

<h2>
  Run with Docker
  <img src="docs/stickers/toolbox.svg" alt="Toolbox sticker" width="66" align="right">
</h2>

1. Install and start Docker Desktop.
2. Copy `.env.example` to `.env` and choose your database password.
3. Build and start the complete application:

```sh
docker compose build
docker compose up
```

Open [Warranty Tracker](http://localhost:3000). The frontend runs in Nginx and forwards API requests to Spring Boot. PostgreSQL data and receipt files persist in the database volume.

The backend is available at [API health](http://localhost:8080/api/health). Change `WEB_PORT`, `API_PORT`, or `APP_TIMEZONE` in `.env` when needed. Keep the application timezone aligned with your browser timezone for calendar dates.

Use `docker compose down` to stop the application while keeping its data. This personal app binds to your own computer and has no account system.

<h2>
  <img src="docs/stickers/smiley-note.svg" alt="Smiling note sticker" width="56" align="left">
  Explore the app
</h2>

Start with your own item, or choose **Explore sample home** from an empty overview. Sample items are clearly labelled and can be edited or deleted. Choose an illustrated category, name your item, then add optional purchase and location details. Each item has tabs for warranties, care tasks, recall notices and replacement parts. Warranty status follows the coverage dates. Receipts support PDF, PNG and JPEG up to 5 MB. Maintenance completion records today's date and schedules the next occurrence from today. A task with no interval completes once. Repeating tasks can be completed once per calendar day.

The care calendar shows maintenance due within 30 days, overdue tasks and warranty reminders within their chosen notice period. Calendar export creates a snapshot for importing into your calendar. Reminders appear inside the app; email and background notifications are not configured. Recall lookup uses [CPSC consumer product records](https://www.cpsc.gov/Data) or [NHTSA vehicle records](https://www.nhtsa.gov/nhtsa-datasets-and-apis). Vehicle lookup needs a model year. Results are potential matches from US sources, not a guarantee of coverage or an exact serial number match. Source failures are shown separately from empty results. Confirm any notice with the manufacturer, then save and resolve it in the tracker.

## Local development

Use Java 21 or newer, Node.js 22.12 or newer, and PostgreSQL. Create a database named `warrantytracker`. Set `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` in the terminal environment. Maven does not load the Docker `.env` file automatically.

Start Spring Boot with the Maven wrapper goal `spring-boot:run`. On Windows the wrapper is `mvnw.cmd`; on other systems use `bash mvnw`.

In the `frontend` directory:

```sh
npm ci
npm run dev
```

Open [Development preview](http://localhost:5173). Vite forwards API requests to port 8080. Set `API_URL` to use a different backend address.
