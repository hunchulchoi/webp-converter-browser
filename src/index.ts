interface Options {
  quality?: number
  width?: number
  height?: number
  keepRatio?: boolean
}

const DEFAULT_QUALITY = 0.75;

function determineSize(
  width?: number,
  originWidth: number,
  height?: number,
  originHeight: number,
  keepRatio?:boolean = false,
) {
  // width와 height를 명확히 입력
  if (width && height) return { width, height };

  if (!width && !height) return { width: originWidth, height: originHeight };

  if (width) {
    if (width > originWidth) return { width: originWidth, height: originHeight };

    if (!keepRatio) return { width, height: originHeight };

    return { width, height: originHeight / originWidth / width };
  }

  if (height) {
    if (height > originHeight) return { width: originWidth, height: originHeight };

    if (!keepRatio) return { width: originWidth, height };

    return { width: originWidth / originHeight / height, height };
  }

  return { width: originWidth, height: originHeight };
}

/**
 * When it cause CORS, you may failed to use
 */
export function srcToWebP(
  src: string,
  {
    quality, width, height, keepRatio,
  }: Options = {},
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    const image = new Image();
    image.src = src;
    image.crossOrigin = 'anonymous';
    image.onload = (e) => {
      const size : {width: number, height: number} = determineSize(width, image.width, height, image.height, keepRatio);
      canvas.width = size.width;
      canvas.height = size.height;
      // @ts-ignore
      URL.revokeObjectURL(e.target.src);
      // @ts-ignore
      context.drawImage(e.target, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((data) => {
        resolve(data as Blob);
      }, 'image/webp', quality || DEFAULT_QUALITY);
    };
    image.onerror = (e) => reject(e);
  });
}

export function blobToWebP(
  data: Blob,
  { quality, width, height }: Options = {},
): Promise<Blob> {
  return srcToWebP(URL.createObjectURL(data), { quality, width, height });
}

export function arrayBufferToWebP(
  data: ArrayBuffer,
  { quality, width, height }: Options = {},
): Promise<Blob> {
  return blobToWebP(new Blob([data]), { quality, width, height });
}
