# SAP PM Knowledge Graph — API (demo)

FastAPI service exposing three read-only endpoints over the SAP PM knowledge
graph (PostgreSQL: `nodes`, `edges`, `node_properties`).

| Method | Path | Purpose |
|---|---|---|
| GET | `/graph/initial` | Seed graph — immediate neighbours of `FL:BOKOR` |
| GET | `/graph/expand?node_id=<id>` | All edges (parent + child) connected to a node |
| GET | `/graph/node-details?node_id=<id>` | A node's full property bag |

Response shape (`/initial`, `/expand`):

```json
{
  "nodes": [{ "id": "FL:BOKOR", "labels": ["FunctionalLocation"], "properties": { "name": "BOKOR" } }],
  "relationships": [{ "id": "A_B", "type": "HAS_CHILD", "source": "A", "target": "B", "properties": {} }]
}
```

## Run

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements.txt

az login                          # database/connection.py uses AzureCliCredential

uvicorn main:app --host 127.0.0.1 --port 8000
```

Interactive docs: http://127.0.0.1:8000/docs

The frontend (`Application/frontend`) reads `KG_API_BASE_URL` (default
`http://127.0.0.1:8000`) from its `.env.local` and proxies to these endpoints
via `/api/kg/*`.
