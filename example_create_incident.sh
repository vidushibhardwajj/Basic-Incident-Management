/*
example_create_incident.sh

Use curl to create an incident:

curl -X POST http://localhost:3000/incident -H "Content-Type: application/json" \
  -d '{"title":"Checkout API 502 errors","description":"Checkout returning 502 and customers cannot pay","severity":"high"}'

*/
