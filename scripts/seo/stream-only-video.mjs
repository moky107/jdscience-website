/** Shared stream-only lesson video markup (watch in browser, no download CTA). */

export function streamOnlyVideoHtml({
  escapeHtml,
  src,
  title,
  posterUrl = null,
  captionUrl = null,
}) {
  const captions = captionUrl
    ? `<track kind="captions" src="${escapeHtml(captionUrl)}" srclang="en" label="English" default />`
    : "";
  return `
            <style>
              .lesson-video { margin: 0 0 24px; background: #0f172a; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 16px rgba(15,23,42,.05); }
              .lesson-video video { display: block; width: 100%; aspect-ratio: 16 / 9; background: #000; }
            </style>
            <figure class="lesson-video">
              <video controls controlsList="nodownload noremoteplayback" disablePictureInPicture playsinline preload="metadata" oncontextmenu="return false;"${posterUrl ? ` poster="${escapeHtml(posterUrl)}"` : ""} title="${escapeHtml(title)}"${captionUrl ? " crossorigin=\"anonymous\"" : ""}>
                <source src="${escapeHtml(src)}" type="video/mp4" />
                ${captions}
              </video>
            </figure>`;
}
