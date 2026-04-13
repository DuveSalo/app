import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openSelfProtectionSystemDocument,
  type SelfProtectionSystemDocumentReference,
} from './documentUtils';
import { getSignedUrl } from '@/lib/api/services/storage';

vi.mock('@/lib/api/services/storage', () => ({
  getSignedUrl: vi.fn(),
}));

interface MockPreviewWindow {
  opener: Window | null;
  document: {
    title: string;
    body: { innerHTML: string };
    open: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };
  location: { replace: ReturnType<typeof vi.fn> };
  close: ReturnType<typeof vi.fn>;
}

const createPreviewWindow = (): MockPreviewWindow => ({
  opener: null,
  document: {
    title: '',
    body: { innerHTML: '' },
    open: vi.fn(),
    write: vi.fn(),
    close: vi.fn(),
  },
  location: {
    replace: vi.fn(),
  },
  close: vi.fn(),
});

describe('openSelfProtectionSystemDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests a fresh signed URL when a storage path is available', async () => {
    const previewWindow = createPreviewWindow();
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(previewWindow as unknown as Window);
    vi.mocked(getSignedUrl).mockResolvedValue('https://example.com/fresh.pdf');

    const document: SelfProtectionSystemDocumentReference = {
      path: 'company-1/drills/file.pdf',
      url: 'https://example.com/stale.pdf',
    };

    await openSelfProtectionSystemDocument(document);

    expect(getSignedUrl).toHaveBeenCalledWith(
      'self-protection-systems',
      'company-1/drills/file.pdf'
    );
    expect(previewWindow.location.replace).toHaveBeenCalledWith('https://example.com/fresh.pdf');
    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    expect(previewWindow.document.write).toHaveBeenCalled();
  });

  it('rebuilds the storage path from a stale signed URL when path is missing', async () => {
    const previewWindow = createPreviewWindow();
    vi.spyOn(window, 'open').mockReturnValue(previewWindow as unknown as Window);
    vi.mocked(getSignedUrl).mockResolvedValue('https://example.com/refreshed.pdf');

    await openSelfProtectionSystemDocument({
      url: 'https://fake-project-id.supabase.co/storage/v1/object/sign/self-protection-systems/company-1/drills/file%20name.pdf?token=stale-token',
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      'self-protection-systems',
      'company-1/drills/file name.pdf'
    );
    expect(previewWindow.location.replace).toHaveBeenCalledWith(
      'https://example.com/refreshed.pdf'
    );
  });

  it('falls back to the stored URL when no storage path can be derived', async () => {
    const previewWindow = createPreviewWindow();
    vi.spyOn(window, 'open').mockReturnValue(previewWindow as unknown as Window);

    await openSelfProtectionSystemDocument({
      url: 'https://example.com/existing.pdf',
    });

    expect(getSignedUrl).not.toHaveBeenCalled();
    expect(previewWindow.location.replace).toHaveBeenCalledWith('https://example.com/existing.pdf');
  });

  it('throws when there is no document reference to open', async () => {
    await expect(openSelfProtectionSystemDocument({})).rejects.toThrow('No hay PDF disponible');
  });
});
