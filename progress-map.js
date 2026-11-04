
/* ojaajo | Slim Pill progress map | 2026-11-05
 * Load AFTER new-ui.js and settings-enhancements.js.
 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const STATUS_COLORS = {
    known: '#78bd9b',
    unknown: '#d9a466',
    unseen: '#555e6d'
  };

  function initProgressMap() {
    const header = document.querySelector('#listWordsView .word-list-sticky');
    const top = header?.querySelector('.compact-top');
    const searchButton = $('listSearchToggle');
    const searchPanel = $('listSearchPanel');
    const list = $('wordList');
    const root = $('appRoot');

    if (!header || !top || !searchButton || !searchPanel ||
        !list || !root || $('listProgressToggle')) return;

    const style = document.createElement('style');
    style.textContent = `
      #listProgressToggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        min-width: 34px;
        height: 34px;
        flex-shrink: 0;
        padding: 5px !important;
      }
      #listProgressToggle svg {
        width: 19px;
        height: 19px;
        display: block;
      }
      #listProgressToggle[aria-expanded="true"] {
        color: var(--accent);
        border-color: var(--accent);
      }
      #listProgressPanel {
        margin: 7px 0 10px;
        padding: 10px 11px 9px;
        background: var(--panel2);
        border: 1px solid var(--line);
        border-radius: 11px;
        color: var(--text);
      }
      #listProgressPanel[hidden] {
        display: none !important;
      }
      .list-progress-map-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 3px;
        font-size: 12px;
      }
      #listProgressPosition {
        color: var(--muted);
        font-size: 11px;
        font-variant-numeric: tabular-nums;
      }
      #listProgressTrack {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 32px;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: ew-resize;
        outline: none;
      }
      #listProgressTrack:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
        border-radius: 5px;
      }
      .list-progress-map-bar {
        height: 9px;
        width: 100%;
        background: #555e6d;
        overflow: hidden;
        border-radius: 999px;
        pointer-events: none;
      }
      #listProgressCanvas {
        display: block;
        height: 9px;
        width: 100%;
      }
      #listProgressCursor {
        position: absolute;
        top: 50%;
        left: 0;
        width: 3px;
        height: 19px;
        transform: translate(-50%, -50%);
        border-radius: 2px;
        background: #ffffff;
        pointer-events: none;
        box-shadow: 0 0 0 1px #131821, 0 0 5px #0009;
      }
      #listProgressTrack[aria-disabled="true"] {
        opacity: .45;
        cursor: default;
      }
      @media (max-width: 420px) {
        #listWordsView .compact-top { gap: 6px; }
        #listProgressToggle {
          min-width: 31px;
          width: 31px;
          height: 33px;
        }
      }
    `;
    document.head.append(style);

    const toggle = document.createElement('button');
    toggle.id = 'listProgressToggle';
    toggle.type = 'button';
    toggle.className = 'btn small subtle';
    toggle.setAttribute('aria-label', '学習進捗マップを開く');
    toggle.setAttribute('title', '学習進捗マップ');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'listProgressPanel');
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor"
           aria-hidden="true">
        <rect x="3" y="12" width="4" height="8" rx="1"/>
        <rect x="10" y="4" width="4" height="16" rx="1"/>
        <rect x="17" y="9" width="4" height="11" rx="1"/>
      </svg>`;
    top.insertBefore(toggle, searchButton);

    const panel = document.createElement('div');
    panel.id = 'listProgressPanel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="list-progress-map-heading">
        <span>学習進捗</span>
        <span id="listProgressPosition"
              aria-live="off">0 / 0語</span>
      </div>
      <div id="listProgressTrack" tabindex="0" role="slider"
        aria-label="学習進捗マップ"
        aria-valuemin="1"
        aria-valuemax="1"
        aria-valuenow="1">
        <div class="list-progress-map-bar">
          <canvas id="listProgressCanvas"
                  aria-hidden="true"></canvas>
        </div>
        <span id="listProgressCursor"
              aria-hidden="true"></span>
      </div>`;
    searchPanel.after(panel);

    const track = $('listProgressTrack');
    const cursor = $('listProgressCursor');
    const positionText = $('listProgressPosition');
    const canvas = $('listProgressCanvas');

    let activePointer = null;
    let updateScheduled = false;

    function displayedRows() {
      return typeof visibleWordRows !== 'undefined' &&
        Array.isArray(visibleWordRows)
          ? visibleWordRows : [];
    }

    function showPosition(index, count) {
      const safeIndex = count
        ? clamp(index, 0, count - 1) : 0;

      positionText.textContent = count
        ? `${safeIndex + 1} / ${count}語`
        : '0 / 0語';

      track.setAttribute(
        'aria-valuemax', String(Math.max(1, count))
      );
      track.setAttribute(
        'aria-valuenow', String(safeIndex + 1)
      );
      track.setAttribute(
        'aria-valuetext',
        count
          ? `${safeIndex + 1}番目 / ${count}語`
          : '表示中の単語がありません'
      );
      track.setAttribute(
        'aria-disabled', count ? 'false' : 'true'
      );

      cursor.style.left = (
        count > 1 ? safeIndex / (count - 1) * 100 : 0
      ) + '%';
    }

    function firstVisibleIndex(rows) {
      if (!rows.length) return 0;

      const viewport = root.getBoundingClientRect();
      const sticky = header.getBoundingClientRect();
      const visibleTop = Math.max(
        viewport.top, sticky.bottom
      ) + 4;

      let lo = 0;
      let hi = rows.length - 1;

      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);

        if (
          rows[mid].node.getBoundingClientRect().bottom >
          visibleTop
        ) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      return lo;
    }

    function syncCursor() {
      if (panel.hidden || activePointer !== null) return;

      const rows = displayedRows();
      showPosition(firstVisibleIndex(rows), rows.length);
    }

    function redraw() {
      if (panel.hidden) return;

      const rows = displayedRows();
      const barWidth = canvas.getBoundingClientRect().width;
      if (barWidth <= 0) return;

      const dpr = Math.min(
        window.devicePixelRatio || 1, 3
      );
      const w = Math.max(1, Math.round(barWidth * dpr));
      const h = Math.max(1, Math.round(9 * dpr));

      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.clearRect(0, 0, w, h);

      if (rows.length) {
        for (let x = 0; x < w; x++) {
          const index = Math.min(
            rows.length - 1,
            Math.floor(x / w * rows.length)
          );
          context.fillStyle =
            STATUS_COLORS[rows[index].word.status] ||
            STATUS_COLORS.unseen;
          context.fillRect(x, 0, 1, h);
        }
      }

      syncCursor();
    }

    function scheduleUpdate() {
      if (panel.hidden || updateScheduled) return;

      updateScheduled = true;
      requestAnimationFrame(() => {
        updateScheduled = false;
        redraw();
      });
    }

    function moveToIndex(index) {
      const rows = displayedRows();
      if (!rows.length) return;

      const i = clamp(index, 0, rows.length - 1);
      const viewport = root.getBoundingClientRect();
      const sticky = header.getBoundingClientRect();

      const visibleTop = Math.max(
        viewport.top, sticky.bottom
      ) + 8;

      const wordTop =
        rows[i].node.getBoundingClientRect().top;

      const maxScroll = Math.max(
        0, root.scrollHeight - root.clientHeight
      );

      root.scrollTop = clamp(
        root.scrollTop + wordTop - visibleTop,
        0,
        maxScroll
      );

      // 単語のフォーカスは変更しない
      if (typeof scheduleListViewSave === 'function') {
        scheduleListViewSave();
      }
    }

    function indexForClientX(clientX) {
      const rows = displayedRows();
      if (!rows.length) return 0;

      const rect = track.getBoundingClientRect();
      const ratio = rect.width > 0
        ? clamp(
            (clientX - rect.left) / rect.width,
            0, 1
          )
        : 0;

      return Math.round(ratio * (rows.length - 1));
    }

    function moveFromPointer(event) {
      const rows = displayedRows();
      if (!rows.length) return;

      const i = indexForClientX(event.clientX);
      showPosition(i, rows.length);
      moveToIndex(i);
    }

    toggle.addEventListener('click', () => {
      const opening = panel.hidden;

      panel.hidden = !opening;
      toggle.setAttribute(
        'aria-expanded', String(opening)
      );
      toggle.setAttribute(
        'aria-label',
        opening
          ? '学習進捗マップを閉じる'
          : '学習進捗マップを開く'
      );

      if (opening) requestAnimationFrame(redraw);

      if (typeof scheduleListViewSave === 'function') {
        scheduleListViewSave();
      }
    });

    track.addEventListener('pointerdown', event => {
      if (
        activePointer !== null ||
        !displayedRows().length
      ) return;

      if (
        event.pointerType === 'mouse' &&
        event.button !== 0
      ) return;

      event.preventDefault();
      activePointer = event.pointerId;

      try {
        track.setPointerCapture(event.pointerId);
      } catch (e) {}

      moveFromPointer(event);
    });

    track.addEventListener('pointermove', event => {
      if (activePointer !== event.pointerId) return;

      event.preventDefault();
      moveFromPointer(event);
    });

    function finishPointer(event) {
      if (activePointer !== event.pointerId) return;

      activePointer = null;

      try {
        if (track.hasPointerCapture(event.pointerId)) {
          track.releasePointerCapture(event.pointerId);
        }
      } catch (e) {}

      requestAnimationFrame(syncCursor);
    }

    track.addEventListener('pointerup', finishPointer);
    track.addEventListener('pointercancel', finishPointer);

    track.addEventListener(
      'lostpointercapture', event => {
        if (activePointer === event.pointerId) {
          activePointer = null;
          requestAnimationFrame(syncCursor);
        }
      }
    );

    track.addEventListener('keydown', event => {
      const rows = displayedRows();
      if (!rows.length) return;

      const current = firstVisibleIndex(rows);
      let next;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          next = current - 1;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          next = current + 1;
          break;
        case 'PageDown':
          next = current + 10;
          break;
        case 'PageUp':
          next = current - 10;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = rows.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      moveToIndex(next);
      requestAnimationFrame(syncCursor);
    });

    let scrollScheduled = false;

    root.addEventListener('scroll', () => {
      if (
        panel.hidden ||
        activePointer !== null ||
        scrollScheduled
      ) return;

      scrollScheduled = true;

      requestAnimationFrame(() => {
        scrollScheduled = false;
        syncCursor();
      });
    }, { passive: true });

    new MutationObserver(scheduleUpdate).observe(
      list,
      {
        childList: true,
        subtree: true,
        characterData: true
      }
    );

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(scheduleUpdate).observe(track);
    } else {
      window.addEventListener(
        'resize',
        scheduleUpdate,
        { passive: true }
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initProgressMap,
      { once: true }
    );
  } else {
    initProgressMap();
  }
})();
