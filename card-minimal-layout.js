
/* Minimal card layout for ojaajo_tool; load after new-ui.js */
(() => {
  'use strict';

  function init() {
    const view = document.getElementById('cardQuizView');
    if (!view || document.getElementById('cardQuickActions')) return;

    const stage = view.querySelector('.card-stage');
    const meaningButton = document.getElementById('revealBtn');
    const exampleButton = document.getElementById('cardExampleToggleBtn');
    const meaning = document.getElementById('cardMeaning');
    const example = document.getElementById('cardExample');

    if (!stage || !meaningButton || !exampleButton || !meaning || !example) return;

    const style = document.createElement('style');
    style.textContent = `
      #cardQuizView .section-head {
        margin-bottom: 12px;
        align-items: center;
      }

      #cardQuizView #cardQuizListName {
        margin-top: 7px !important;
        color: var(--text);
        font-size: 13px;
        letter-spacing: 0;
        text-transform: none;
      }

      #cardQuizView .card-stage {
        min-height: 0;
        padding: 16px 17px 25px;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        text-align: center;
      }

      #cardQuizView #cardSetupListName {
        display: none !important;
      }

      #cardQuizView #cardQuickActions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-bottom: 22px;
      }

      #cardQuizView .card-quick-btn {
        width: 42px;
        height: 40px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        border: 1px solid var(--line);
        background: var(--panel2);
        color: var(--muted);
        cursor: pointer;
      }

      #cardQuizView .card-quick-btn[aria-pressed="true"] {
        color: var(--accent);
        border-color: #647a46;
        background: #2b3528;
      }

      #cardQuizView .card-quick-btn svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      #cardQuizView .card-ko-line {
        margin: 14px 0 20px;
        gap: 10px;
      }

      #cardQuizView .card-korean {
        margin: 0;
        font-size: clamp(32px, 8vw, 46px);
      }

      #cardQuizView .card-meaning {
        margin: 0 0 17px;
        min-height: 30px;
        font-size: 20px;
      }

      #cardQuizView .card-example {
        margin: 6px 0 4px;
        padding: 13px;
      }

      #cardQuizView .card-stage > .space {
        display: none;
      }

      #cardQuizView #revealBtn,
      #cardQuizView #cardExampleToggleBtn {
        display: none !important;
      }

      #cardQuizView .card-controls {
        margin-top: 12px;
      }

      #cardQuizView .card-controls button {
        min-height: 49px;
      }

      #cardQuizView .card-minimal-nav {
        margin-top: 8px !important;
        gap: 8px;
      }

      #cardQuizView .card-minimal-nav button {
        min-height: 42px;
        background: transparent;
        border-color: transparent;
        color: var(--muted);
        font-size: 14px;
      }

      #cardQuizView .card-minimal-nav button:active {
        background: var(--panel2);
      }

      #cardQuizView .card-legacy-note {
        display: none !important;
      }
    `;

    document.head.appendChild(style);

    const actions = document.createElement('div');
    actions.id = 'cardQuickActions';

    const makeButton = (label, icon, onClick) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'card-quick-btn';
      b.setAttribute('aria-label', label);
      b.title = label;
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = icon;
      b.addEventListener('click', onClick);
      actions.appendChild(b);
      return b;
    };

    const eye = makeButton(
      '意味を表示・非表示',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
      () => meaningButton.click()
    );

    const book = makeButton(
      '例文を表示・非表示',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/></svg>',
      () => exampleButton.click()
    );

    stage.prepend(actions);

    const nav = view.querySelector('.card-controls + .row');
    if (nav) nav.classList.add('card-minimal-nav');

    const note = [...view.querySelectorAll('p')].find(
      p => p.textContent.includes('暗記状態は試作内のみ')
    );
    if (note) note.classList.add('card-legacy-note');

    const sync = () => {
      const meaningShown = meaningButton.textContent.includes('隠す');
      const exampleShown = !example.hidden;

      eye.setAttribute('aria-pressed', String(meaningShown));
      book.setAttribute('aria-pressed', String(exampleShown));

      eye.title = meaningShown ? '意味を隠す' : '意味を表示';
      book.title = exampleShown ? '例文を隠す' : '例文を表示';
    };

    new MutationObserver(sync).observe(meaningButton, {
      childList: true,
      characterData: true,
      subtree: true
    });

    new MutationObserver(sync).observe(example, {
      attributes: true,
      attributeFilter: ['hidden']
    });

    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {
      once: true
    });
  } else {
    init();
  }
})();
