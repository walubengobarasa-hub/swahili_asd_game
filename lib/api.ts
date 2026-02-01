const BASE_URL = "http://127.0.0.1:8000"; // use LAN IP on phone (e.g. http://192.168.x.x:8000)

export async function postJSON(path: string, body: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getJSON(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
