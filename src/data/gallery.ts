import { getImage } from 'astro:assets';

// Link attributes that let an image open in the full-screen gallery.
// The link still works as a plain image link if the script does not run.
export async function galleryAttrs(image: ImageMetadata, caption: string) {
  const largeWidth = Math.min(image.width, 1800);
  const smallWidth = Math.min(image.width, 900);
  const [small, large] = await Promise.all([
    getImage({ src: image, width: smallWidth, format: 'webp' }),
    getImage({ src: image, width: largeWidth, format: 'webp' }),
  ]);
  return {
    href: large.src,
    'data-viewer': true,
    'data-srcset': `${small.src} ${smallWidth}w, ${large.src} ${largeWidth}w`,
    'data-caption': caption,
  };
}
