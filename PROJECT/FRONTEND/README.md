# HEMS frontend: C backend contract

Browsers cannot open FIFOs or read alerts.log directly. Serve these files from a web server
(e.g. nginx/Apache) and expose a small **C gateway (CGI program)** that bridges HTTP to your existing
FIFO / alerts.log logic. No Python/Node. The frontend never computes status; it only displays what the backend returns.

| Endpoint | Request | Response |
|---|---|---|
| GET  /cgi-bin/health  | - | `{"ok":true}` |
| POST /cgi-bin/monitor | `{"id","name","age","hr","bp":"120/80","temp","spo2"}` | `{"status":"NORMAL"\|"WARNING"\|"EMERGENCY","detail":"optional"}` |
| GET  /cgi-bin/alerts  | - | `{"entries":[{"time":"ISO-8601","id","name","age","hr","bp","temp","spo2","status"}]}` (parsed from alerts.log) |
| POST /cgi-bin/login (optional) | `{"username","password"}` | 200 ok / 401 |

`monitor` handler: write the record to your existing input FIFO, read the status the emergency processor sends back,
return it as JSON. Change `CONFIG.API_BASE` in script.js if your gateway lives elsewhere.
Demo sign-in (only when backend is unreachable): admin / admin123, remove before real use.
