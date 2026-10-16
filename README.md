# LibroHub Library Management System

This project contains the existing React frontend and Flask backend for the LibroHub library management system.

## Requirements

- Python 3.11+
- Node.js 18+
- npm
- VS Code recommended

## Windows setup

1. Open PowerShell in the project root.
2. Install backend dependencies:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```powershell
   cd ..\demo
   npm install
   ```
4. Copy environment templates if needed:
   ```powershell
   Copy-Item ..\backend\.env.example ..\backend\.env
   Copy-Item .env.example .env
   ```
5. Update the values in the `.env` files as needed.

## Create the first administrator securely

Run the admin command from the backend folder:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
flask --app app create-admin
```

Choose a secure username and a strong password with at least 12 characters. Do not expose the password in scripts or source control.

## Start the backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```

The backend runs at:

- http://127.0.0.1:5000

## Start the frontend

Open a second terminal and run:

```powershell
cd demo
npm run dev -- --host 0.0.0.0
```

Open the local Vite URL shown in the terminal, usually:

- http://localhost:5173/

## Back up the database

```powershell
Copy-Item backend\library.db backend\library-backup-YYYY-MM-DD.db
```

## Run checks

Backend tests:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m pytest -q
```

Frontend production build:

```powershell
cd demo
npm run build
```

Lint:

```powershell
cd demo
npm run lint
```

## Troubleshooting

- If login fails, confirm the backend is running and CORS settings allow the frontend URL.
- If session is lost after login, verify cookies are enabled and the backend `FRONTEND_ORIGIN` matches the frontend URL.
- If the app shows database errors, check the SQLite file path and confirm the server is not running with a different database file.
- If packages are missing, run the install steps above again.

## Notes

- The frontend uses the Flask APIs and session cookie authentication.
- Do not run `seed.py` or delete the SQLite database during normal application startup.
- Local demo data should never replace the database-backed production data automatically.
