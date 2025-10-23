document.getElementById('incidentForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const severity = document.getElementById('severity').value;

  const response = await fetch('/incident', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'yourapikeyhere'  // Replace with your real API key
    },
    body: JSON.stringify({ title, description, severity })
  });

  const data = await response.json();

  if(response.ok){
    alert('Incident submitted successfully!');
    this.reset();
  } else {
    alert('Error: ' + (data.error || JSON.stringify(data.errors)));
  }
});
