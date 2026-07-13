export async function captureCanvasScreenshot(canvas: HTMLCanvasElement, filename = 'planetario.png') {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  }).then((blob) => {
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  });
}

export function buildShareUrl({ scene, objectId }: { scene?: string; objectId?: string }) {
  const url = new URL(window.location.href);
  url.hash = '';
  const parts: string[] = [];
  if (scene) parts.push(`scene=${encodeURIComponent(scene)}`);
  if (objectId) parts.push(`obj=${encodeURIComponent(objectId)}`);
  if (parts.length) url.hash = parts.join('&');
  return url.toString();
}

export async function copyShareLink(options: { scene?: string; objectId?: string }) {
  const link = buildShareUrl(options);
  await navigator.clipboard.writeText(link);
  return link;
}

export async function shareNative({
  title,
  text,
  url,
}: {
  title: string;
  text?: string;
  url: string;
}) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

export function parseShareHash() {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return {};
  const params = new URLSearchParams(raw);
  return {
    scene: params.get('scene') || undefined,
    objectId: params.get('obj') || undefined,
  };
}
