import { getSignedUrl } from '@/lib/api/services/storage';

export interface SupabaseStorageDocumentReference {
  path?: string;
  url?: string;
}

interface OpenSupabaseStorageDocumentOptions extends SupabaseStorageDocumentReference {
  bucket: string;
  title?: string;
  message?: string;
}

const buildLoadingMarkup = ({
  title,
  message,
}: {
  title: string;
  message: string;
}): string => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f7fb;
        --surface: rgba(255, 255, 255, 0.9);
        --surface-border: rgba(15, 23, 42, 0.08);
        --text: #0f172a;
        --muted: #64748b;
        --accent: #0f172a;
        --accent-soft: rgba(15, 23, 42, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        overflow: hidden;
        background:
          radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 34%),
          radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.12), transparent 30%),
          linear-gradient(180deg, #fbfcfe 0%, var(--bg) 100%);
        font-family: Inter, "Segoe UI", sans-serif;
        color: var(--text);
      }

      .shell {
        position: relative;
        width: min(420px, calc(100vw - 32px));
        padding: 28px;
        border: 1px solid var(--surface-border);
        border-radius: 24px;
        background: var(--surface);
        backdrop-filter: blur(18px);
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--muted);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #10b981;
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
        animation: pulse 1.8s infinite;
      }

      h1 {
        margin: 18px 0 10px;
        font-size: clamp(28px, 4vw, 34px);
        line-height: 1;
        letter-spacing: -0.04em;
      }

      p {
        margin: 0;
        font-size: 15px;
        line-height: 1.6;
        color: var(--muted);
      }

      .progress {
        margin-top: 22px;
        height: 10px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(148, 163, 184, 0.16);
      }

      .progress::before {
        content: "";
        display: block;
        width: 42%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #0f172a 0%, #334155 100%);
        animation: travel 1.4s ease-in-out infinite;
      }

      .hint {
        margin-top: 14px;
        font-size: 13px;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
        }
        70% {
          box-shadow: 0 0 0 14px rgba(16, 185, 129, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
      }

      @keyframes travel {
        0% {
          transform: translateX(-110%);
        }
        100% {
          transform: translateX(280%);
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <div class="badge">
        <span class="dot"></span>
        Documento privado
      </div>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="progress" aria-hidden="true"></div>
      <p class="hint">La ventana se actualizará automáticamente en cuanto el archivo esté listo.</p>
    </main>
  </body>
</html>`;

const openPendingWindow = ({
  title = 'Abriendo PDF',
  message = 'Generando un enlace temporal seguro para mostrar el documento.',
}: {
  title?: string;
  message?: string;
}): Window | null => {
  const previewWindow = window.open('', '_blank');

  if (!previewWindow) {
    return null;
  }

  previewWindow.opener = null;
  previewWindow.document.open();
  previewWindow.document.write(buildLoadingMarkup({ title, message }));
  previewWindow.document.close();

  return previewWindow;
};

const extractStoragePathFromUrl = (bucket: string, url?: string): string | null => {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const prefixes = [
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/public/${bucket}/`,
    ] as const;

    for (const prefix of prefixes) {
      const prefixIndex = parsedUrl.pathname.indexOf(prefix);

      if (prefixIndex === -1) {
        continue;
      }

      const encodedPath = parsedUrl.pathname.slice(prefixIndex + prefix.length);
      return encodedPath ? decodeURIComponent(encodedPath) : null;
    }
  } catch {
    return null;
  }

  return null;
};

export const resolveSupabaseStorageDocumentUrl = async ({
  bucket,
  path,
  url,
}: OpenSupabaseStorageDocumentOptions): Promise<string> => {
  const resolvedPath = path ?? extractStoragePathFromUrl(bucket, url);

  if (resolvedPath) {
    return getSignedUrl(bucket, resolvedPath);
  }

  if (url) {
    return url;
  }

  throw new Error('No hay PDF disponible');
};

export const openSupabaseStorageDocument = async (
  options: OpenSupabaseStorageDocumentOptions
): Promise<void> => {
  const { title, message } = options;

  if (!options.path && !options.url) {
    throw new Error('No hay PDF disponible');
  }

  const previewWindow = openPendingWindow({ title, message });

  try {
    const resolvedUrl = await resolveSupabaseStorageDocumentUrl(options);

    if (previewWindow) {
      previewWindow.location.replace(resolvedUrl);
      return;
    }

    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    previewWindow?.close();

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('No se pudo abrir el PDF');
  }
};
