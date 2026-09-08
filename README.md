<div align="center">
  <big><big><big><big><big><big><big><big><big><b>Warranty Tracker</b><big><big><big></big></big></big><big><big><big>
</div>

<br>

<b>About</b>

Warranty Tracker is a full stack home asset management project inspired by how difficult it can be to keep track of everything you own once warranties, receipts, maintenance, and recall information start piling up.

After seeing how scattered and inconvenient that process can be, I wanted to build one place where each asset can have its warranty details, maintenance history, receipts, recalls, replacement parts, and reminders organized together.

<b>What it tracks</b>

- Assets such as appliances, electronics, vehicles, baby products, and home equipment
- Warranties, coverage dates, status, and receipts
- Maintenance tasks and recurring care schedules
- Recall notices, replacement parts, and reminders

<b>Built with</b>

Java 21 · Spring Boot · Spring Data JPA · PostgreSQL · React · TypeScript · Vite · Docker · GitHub Actions

<b>Run with Docker</b>

Copy `.env.example` to `.env`, choose your local database password, then run:

```sh
docker compose up --build
```

Open `http://localhost:3000` after the containers are running.

<b>Local development</b>

Run the Spring Boot backend on port `8080`, then from the `frontend` directory run:

```sh
npm ci
npm run dev
```

Open `http://localhost:5173` in your browser while the Vite development server is running.
