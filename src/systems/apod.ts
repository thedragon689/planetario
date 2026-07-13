export interface ApodEntry {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
}

const APOD_URL = 'https://api.nasa.gov/planetary/apod';

export async function fetchApod(apiKey?: string): Promise<ApodEntry | null> {
  const key = apiKey || import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
  try {
    const res = await fetch(`${APOD_URL}?api_key=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      date: data.date,
      explanation: data.explanation,
      url: data.url,
      hdurl: data.hdurl,
      media_type: data.media_type,
    };
  } catch {
    return null;
  }
}
