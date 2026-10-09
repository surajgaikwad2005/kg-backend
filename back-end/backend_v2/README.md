# SAP PM Knowledge Graph Backend (Modular Architecture)

This folder contains the restructured backend application designed for modularity, clean separation of concerns, and future authentication support.

## Folder Structure

```
backend_v2/
│
├── app.py                     # FastAPI main application entry point
├── config.ini                 # Centralized configuration (Azure DB, server, auth)
├── utils.py                   # Central hub for all common functions (get_conf, responses, etc.)
├── requirements.txt           # Python dependencies
│
├── db/                        # Database module
│   ├── __init__.py
│   └── connection.py          # Azure PostgreSQL connection pool + Entra ID token auth
│
├── kg/                        # Knowledge Graph module
│   ├── __init__.py
│   ├── main.py                # KG endpoints (clean route definitions & function calls)
│   ├── schemas.py             # Request & Response models for KG
│   ├── service.py             # KG caching & business logic
│   └── repository.py          # SQL queries for nodes, edges, and properties
│
└── auth/                      # Authentication module
    ├── __init__.py
    ├── main.py                # Auth endpoints (clean route definitions & function calls)
    ├── schemas.py             # Request & Response models for Auth
    └── service.py             # User credential verification & database logic
```

## How to Run

From this folder:
```bash
python app.py
```

The API will be available at:
- **API Base:** http://127.0.0.1:8000
- **Swagger Docs:** http://127.0.0.1:8000/docs
- **Health Check:** http://127.0.0.1:8000/health
