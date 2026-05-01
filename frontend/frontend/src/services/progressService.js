const BASE_URL = "http://localhost:8080/api/progress";

const getToken = () => localStorage.getItem("token");

export async function analyzeProgress(payload) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to analyze progress");
  const data = await res.json();
  return { data };
}

export async function adjustRoadmap(payload) {
  const res = await fetch(`${BASE_URL}/adjust`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to adjust roadmap");
  const data = await res.json();
  return { data };
}