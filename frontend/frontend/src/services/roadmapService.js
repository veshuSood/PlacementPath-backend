const BASE_URL = "http://localhost:8080/api/roadmap";

const getToken = () => localStorage.getItem("token");

export async function getActiveRoadmap() {
  const res = await fetch(`${BASE_URL}/active`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });
  if (res.status === 404) return { data: null };
  if (!res.ok) throw new Error("Failed to fetch roadmap");
  const data = await res.json();
  return { data };
}

export async function generateRoadmap() {
  const token = getToken();
  const username = localStorage.getItem("username");

  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username
    }),
  });
  if (!res.ok) throw new Error("Failed to generate roadmap");
  const data = await res.json();
  return { data };
}