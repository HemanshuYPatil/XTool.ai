import { BASE_VARIABLES, OCEAN_BREEZE_THEME } from "./themes";

export function getHTMLWrapper(
  html: string,
  title = "Untitled",
  theme_style?: string,
  frameId?: string
) {
  const finalTheme = theme_style || OCEAN_BREEZE_THEME;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>

  <!-- Google Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>

  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet">

  <!-- Tailwind + Iconify -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>


  <style type="text/tailwindcss">
    :root {${BASE_VARIABLES}${finalTheme}}
    *, *::before, *::after {margin:0;padding:0;box-sizing:border-box;}
    html, body {width:100%;min-height:100%;}
    body {font-family:var(--font-sans);background:var(--background);color:var(--foreground);-webkit-font-smoothing:antialiased;}
    #root {width:100%;min-height:100vh;}
    * {scrollbar-width:none;-ms-overflow-style:none;}
    *::-webkit-scrollbar {display:none;}
  </style>
</head>
<body>
  <div id="root">
  <div class="relative">
    ${html}
  </div>
  <script>
    (()=>{
      const fid='${frameId}';
      let toolMode = 'EDIT';
      let selectedEl = null;
      let hoverEl = null;
      let isDragging = false;
      let dragStart = { x: 0, y: 0 };
      let dragOrigin = { x: 0, y: 0 };
      let suppressClick = false;
      let updateTimer = null;

      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.pointerEvents = 'none';
      overlay.style.border = '2px solid #3b82f6';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'none';
      document.body.appendChild(overlay);

      const hoverOverlay = document.createElement('div');
      hoverOverlay.style.position = 'fixed';
      hoverOverlay.style.pointerEvents = 'none';
      hoverOverlay.style.border = '1px dashed #3b82f6';
      hoverOverlay.style.zIndex = '9998';
      hoverOverlay.style.display = 'none';
      document.body.appendChild(hoverOverlay);

      const updateOverlay = (el, target) => {
        if (!el) {
          target.style.display = 'none';
          return;
        }
        const rect = el.getBoundingClientRect();
        target.style.display = 'block';
        target.style.top = rect.top + 'px';
        target.style.left = rect.left + 'px';
        target.style.width = rect.width + 'px';
        target.style.height = rect.height + 'px';
      };

      const isRootElement = (el) => {
        if (!el) return true;
        return (
          el === document.body ||
          el === document.documentElement ||
          el.id === 'root'
        );
      };

      const parseTranslate = (el) => {
        const stored = el.dataset.xtoolTranslate;
        if (stored) {
          const [sx, sy] = stored.split(',').map((v) => parseFloat(v.trim()));
          return {
            x: Number.isFinite(sx) ? sx : 0,
            y: Number.isFinite(sy) ? sy : 0,
          };
        }
        const transform = window.getComputedStyle(el).transform;
        if (transform && transform !== 'none') {
          const match = transform.match(/matrix\\(([^)]+)\\)/);
          if (match) {
            const parts = match[1].split(',');
            const x = parseFloat(parts[4]);
            const y = parseFloat(parts[5]);
            return {
              x: Number.isFinite(x) ? x : 0,
              y: Number.isFinite(y) ? y : 0,
            };
          }
        }
        return { x: 0, y: 0 };
      };

      const send = () => {
        const r = document.getElementById('root')?.firstElementChild;
        const h = r?.className.match(/h-(screen|full)|min-h-screen/)
          ? Math.max(800, innerHeight)
          : Math.max(r?.scrollHeight || 0, document.body.scrollHeight, 800);
        parent.postMessage({ type: 'FRAME_HEIGHT', frameId: fid, height: h }, '*');
      };

      const emitFrameContentUpdate = () => {
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
          const wrapper = document.querySelector('#root > .relative');
          const htmlContent = wrapper ? wrapper.innerHTML : '';
          parent.postMessage({
            type: 'FRAME_CONTENT_UPDATED',
            frameId: fid,
            htmlContent,
          }, '*');
          send();
        }, 150);
      };

      const getElementInfo = (el) => {
        const style = window.getComputedStyle(el);
        const info = {
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          text:
            el.tagName.toLowerCase() === 'input' ||
            el.tagName.toLowerCase() === 'textarea'
              ? el.value
              : el.innerText,
          attributes: {},
          styles: {
            color: style.color,
            backgroundColor: style.backgroundColor,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            padding: style.padding,
            margin: style.margin,
            borderRadius: style.borderRadius,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            textAlign: style.textAlign,
            display: style.display,
            flexDirection: style.flexDirection,
            alignItems: style.alignItems,
            justifyContent: style.justifyContent,
            gap: style.gap,
          }
        };

        if (el.tagName.toLowerCase() === 'iconify-icon') {
          info.type = 'icon';
          info.attributes.icon = el.getAttribute('icon');
        } else if (el.tagName.toLowerCase() === 'button' || el.classList.contains('btn')) {
          info.type = 'button';
        } else if (el.tagName.toLowerCase() === 'a') {
          info.type = 'link';
          info.attributes.href = el.getAttribute('href');
        } else if (el.tagName.toLowerCase() === 'img') {
          info.type = 'image';
          info.attributes.src = el.getAttribute('src');
        } else if (
          el.tagName.toLowerCase() === 'input' ||
          el.tagName.toLowerCase() === 'textarea'
        ) {
          info.type = 'input';
          info.attributes.placeholder = el.getAttribute('placeholder');
        }

        return info;
      };

      document.addEventListener('mouseover', (e) => {
        if (toolMode !== 'EDIT') return;
        if (e.target === document.body || e.target === document.documentElement) return;
        hoverEl = e.target;
        updateOverlay(hoverEl, hoverOverlay);
      });

      document.addEventListener('click', (e) => {
        if (toolMode !== 'EDIT') return;
        if (suppressClick) {
          suppressClick = false;
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (isRootElement(e.target)) return;
        selectedEl = e.target;
        selectedEl.style.cursor = 'grab';
        updateOverlay(selectedEl, overlay);
        parent.postMessage({
          type: 'ELEMENT_SELECTED',
          frameId: fid,
          elementInfo: getElementInfo(selectedEl)
        }, '*');
      });

      document.addEventListener('mousedown', (e) => {
        if (toolMode !== 'EDIT') return;
        if (!selectedEl || e.target !== selectedEl) return;
        if (isRootElement(selectedEl)) return;
        isDragging = true;
        suppressClick = false;
        dragStart = { x: e.clientX, y: e.clientY };
        dragOrigin = parseTranslate(selectedEl);
        selectedEl.style.cursor = 'grabbing';
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging || !selectedEl) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        if (Math.abs(dx) + Math.abs(dy) < 2) return;
        suppressClick = true;
        const nextX = dragOrigin.x + dx;
        const nextY = dragOrigin.y + dy;
        selectedEl.style.transform =
          "translate(" + nextX + "px, " + nextY + "px)";
        selectedEl.dataset.xtoolTranslate = "" + nextX + "," + nextY;
        updateOverlay(selectedEl, overlay);
      });

      document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        if (selectedEl) {
          selectedEl.style.cursor = 'grab';
        }
        emitFrameContentUpdate();
      });

      window.addEventListener('message', (e) => {
        if (e.data.type === 'SET_TOOL_MODE' && e.data.frameId === fid) {
          toolMode = e.data.toolMode || 'EDIT';
          if (toolMode !== 'EDIT') {
            updateOverlay(null, overlay);
            updateOverlay(null, hoverOverlay);
          }
        }
        if (
          e.data.type === 'UPDATE_ELEMENT' &&
          e.data.frameId === fid &&
          selectedEl
        ) {
          const { styles, text, attributes } = e.data;
          if (text !== undefined) {
            if (
              selectedEl.tagName.toLowerCase() === 'input' ||
              selectedEl.tagName.toLowerCase() === 'textarea'
            ) {
              selectedEl.value = text;
            } else {
              selectedEl.innerText = text;
            }
          }
          if (styles) {
            Object.assign(selectedEl.style, styles);
          }
          if (attributes) {
            for (const [key, value] of Object.entries(attributes)) {
              selectedEl.setAttribute(key, value);
            }
          }
          updateOverlay(selectedEl, overlay);
          emitFrameContentUpdate();
        }
      });

      setTimeout(send,100);
      setTimeout(send,500);
      
      window.addEventListener('resize', send);
    })();
  </script>


</body>
</html>`;
}
