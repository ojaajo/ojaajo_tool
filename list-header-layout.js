
/* ojaajo compact list header — loaded after new-ui.js */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);

  function init() {
    const view = $('listWordsView');
    const header = view?.querySelector('.word-list-sticky');
    const top = header?.querySelector('.compact-top');
    const search = $('listSearchToggle');
    const settings = $('listSettingsPanel');
    const range = $('pageRangePanel');
    const rangeSummary = header?.querySelector('.range-summary');

    if (!top || !search || !settings || !range ||
        !rangeSummary || $('compactRangeToggle')) return;

    const css = document.createElement('style');
    css.textContent = `
      #listWordsView .compact-top {
        display:flex; gap:6px; align-items:center; min-width:0;
      }
      #listWordsView .compact-top > strong {
        flex:1 1 0; min-width:0; overflow:hidden;
        text-overflow:ellipsis; white-space:nowrap;
      }
      #listWordsView .compact-top > button {
        flex-shrink:0;
      }
      #listWordsView .compact-top > #listSearchToggle,
      #listWordsView .compact-top > #compactRangeToggle,
      #listWordsView .compact-top > #compactListSettingsToggle,
      #listWordsView .compact-top > #listProgressToggle {
        box-sizing:border-box;
        width:42px; min-width:42px; height:42px;
        padding:0!important;
        display:inline-flex; align-items:center;
        justify-content:center;
        border-radius:12px;
        font-size:22px; line-height:1;
      }
      #listWordsView .compact-top > #listProgressToggle svg {
        width:19px; height:19px;
      }
      #listWordsView .compact-top > #compactRangeToggle svg {
        width:20px; height:20px;
      }
      #listWordsView .compact-top > #compactListSettingsToggle {
        font-size:21px;
      }
      #listWordsView .compact-top > #compactListBack {
        flex-shrink:0; white-space:nowrap;
      }
      #listWordsView .compact-top > #compactListBack .compact-back-arrow {
        display:none;
      }
      #listWordsView .range-summary {
        display:none!important;
      }
      #listWordsView .compact-settings-section {
        padding-top:12px; margin-top:12px;
        border-top:1px solid var(--line);
      }
      #listWordsView .compact-settings-title {
        font-size:13px; font-weight:700; margin-bottom:10px;
      }
      #listWordsView .compact-settings-actions {
        display:grid; gap:8px;
      }
      #listWordsView .compact-settings-actions button {
        width:100%; text-align:left; min-height:40px;
      }
      #listWordsView #compactRangeToggle[aria-expanded="true"],
      #listWordsView #compactListSettingsToggle[aria-expanded="true"] {
        color:var(--accent);
      }
      @media(max-width:420px) {
        #listWordsView .compact-top { gap:5px; }
        #listWordsView .compact-top > #listSearchToggle,
        #listWordsView .compact-top > #compactRangeToggle,
        #listWordsView .compact-top > #compactListSettingsToggle,
        #listWordsView .compact-top > #listProgressToggle {
          width:38px; min-width:38px; height:40px;
        }
        #listWordsView .compact-top > #compactListBack {
          padding-left:9px; padding-right:9px;
        }
      }
      @media(max-width:365px) {
        #listWordsView .compact-top > #compactListBack .compact-back-label {
          display:none;
        }
        #listWordsView .compact-top > #compactListBack .compact-back-arrow {
          display:inline;
        }
      }
    `;
    document.head.append(css);

    const back = top.querySelector(
      'button[onclick*="showListIndex"]'
    );
    if (back) {
      back.id = 'compactListBack';
      back.innerHTML =
        '<span class="compact-back-label">← 戻る</span>' +
        '<span class="compact-back-arrow" aria-hidden="true">←</span>';
      back.setAttribute('aria-label','リスト一覧に戻る');
    }

    const title = $('selectedListTitle');
    if (title) {
      title.title = title.textContent.trim();
      const titleObserver = new MutationObserver(() => {
        title.title = title.textContent.trim();
      });
      titleObserver.observe(title,{
        childList:true, characterData:true, subtree:true
      });
    }

    const add = [...top.querySelectorAll('button')].find(
      b => b.getAttribute('onclick') === 'openAdd()'
    );
    if (add) add.remove();

    const oldSettings = [...top.querySelectorAll('button')].find(
      b => b.getAttribute('onclick') === 'toggleListSettings()'
    );
    if (oldSettings) oldSettings.remove();

    const rangeButton = document.createElement('button');
    rangeButton.id = 'compactRangeToggle';
    rangeButton.type = 'button';
    rangeButton.className = 'btn small subtle';
    rangeButton.title = '表示ページ範囲';
    rangeButton.setAttribute('aria-label','表示ページ範囲');
    rangeButton.setAttribute('aria-controls','pageRangePanel');
    rangeButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M3 10h18M9 10v10M15 10v10"/>
      </svg>`;

    const settingsButton = document.createElement('button');
    settingsButton.id = 'compactListSettingsToggle';
    settingsButton.type = 'button';
    settingsButton.className = 'btn small subtle';
    settingsButton.textContent = '⚙';
    settingsButton.title = '表示設定・単語管理';
    settingsButton.setAttribute(
      'aria-label','表示設定・単語管理'
    );
    settingsButton.setAttribute(
      'aria-controls','listSettingsPanel'
    );

    search.after(rangeButton,settingsButton);

    const section = document.createElement('div');
    section.className = 'compact-settings-section';
    section.innerHTML =
      '<div class="compact-settings-title">単語管理</div>' +
      '<div class="compact-settings-actions"></div>';

    const actions = section.querySelector(
      '.compact-settings-actions'
    );

    function action(text, callback) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn small subtle';
      b.textContent = text;
      b.addEventListener('click',callback);
      actions.append(b);
    }

    action('＋ 単語を追加',() => {
      settings.hidden = true;
      window.openAdd?.();
      sync();
    });

    action('⇧ ファイルからインポート',() => {
      settings.hidden = true;
      window.openImport?.();
      sync();
    });

    const rename = $('renameListButton');
    const remove = $('deleteListButton');
    if (rename) actions.append(rename);
    if (remove) actions.append(remove);
    settings.append(section);

    function sync() {
      rangeButton.setAttribute(
        'aria-expanded',String(!range.hidden)
      );
      settingsButton.setAttribute(
        'aria-expanded',String(!settings.hidden)
      );
      const total = $('rangeWordCount')?.textContent?.trim();
      const label = $('rangeSummary')?.textContent?.trim();
      rangeButton.title =
        `表示ページ範囲: ${label || ''} ${total || ''}`.trim();
    }

    rangeButton.addEventListener('click',() => {
      range.hidden = !range.hidden;
      settings.hidden = true;
      sync();
      window.scheduleListViewSave?.();
    });

    settingsButton.addEventListener('click',() => {
      settings.hidden = !settings.hidden;
      range.hidden = true;
      sync();
      window.scheduleListViewSave?.();
    });

    new MutationObserver(sync).observe(range,{
      attributes:true, attributeFilter:['hidden']
    });
    new MutationObserver(sync).observe(settings,{
      attributes:true, attributeFilter:['hidden']
    });
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',init,{once:true}
    );
  } else {
    init();
  }
})();
