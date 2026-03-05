# Duet

Duet is a one-on-one scheduling web app with a React frontend and a Django REST backend.

## Project Structure

```text
.
├── backend/                    # Django app
│   ├── OneOnOne/csc309_duet/   # Django project root (manage.py lives here)
│   ├── requirements.txt
│   ├── startup.sh              # create venv + install + migrate
│   └── run.sh                  # run Django dev server
├── frontend/                   # React app (Create React App)
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+

## Local Development

1. Start backend:

```bash
cd backend
bash startup.sh
bash run.sh
```

Backend runs at `http://localhost:8000`.

2. Start frontend (new terminal):

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

## Notes

- Frontend API calls are currently hardcoded to `http://localhost:8000`.
- Keep `node_modules` and virtual environments out of Git; root `.gitignore` now covers this.
