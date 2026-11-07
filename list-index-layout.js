
/* リスト一覧：検索ボタン統一・リスト編集メニュー */
(() => {
  "use strict";

  function init() {
    const view = document.getElementById("listIndexView");
    const search = document.getElementById("globalSearchToggle");

    if (!view || !search ||
        document.getElementById("listIndexEditToggle")) {
      return;
    }

    const headerActions = search.parentElement;
    const createButton = [...headerActions.querySelectorAll("button")]
      .find(button =>
        button.getAttribute("onclick") === "openCreateList()"
      );

    if (!createButton) return;

    // デザイン
    const style = document.createElement("style");
    style.textContent = `
      #listIndexView #globalSearchToggle,
      #listIndexEditToggle {
        box-sizing: border-box;
        height: 44px;
        min-height: 44px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      #listIndexView #globalSearchToggle {
        width: 44px;
        min-width: 44px;
        padding: 0 !important;
        font-size: 24px;
        line-height: 1;
      }

      #listIndexEditToggle {
        gap: 7px;
        padding: 0 12px;
        white-space: nowrap;
        font-size: 13px;
      }

      #listIndexEditToggle svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      #listIndexEditMenu {
        margin: 0 0 16px;
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--panel2);
        display: grid;
        gap: 8px;
      }

      #listIndexEditMenu[hidden] {
        display: none !important;
      }

      #listIndexEditMenu button {
        width: 100%;
        min-height: 46px;
        display: flex;
        align-items: center;
        gap: 10px;
        text-align: left;
        padding: 10px 12px;
      }

      #listIndexEditMenu button svg {
        width: 19px;
        height: 19px;
        flex-shrink: 0;
        color: var(--accent);
      }

      @media (max-width: 390px) {
        #listIndexEditToggle {
          padding: 0 9px;
          gap: 5px;
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(style);

    // 既存の新規作成ボタンをメニューに移動
    createButton.remove();

    const editButton = document.createElement("button");
    editButton.id = "listIndexEditToggle";
    editButton.type = "button";
    editButton.className = "btn small";
    editButton.setAttribute("aria-expanded", "false");
    editButton.setAttribute("aria-controls", "listIndexEditMenu");
    editButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"/>
        <path d="M3 7h8M3 12h5"/>
      </svg>
      <span>リスト編集</span>
    `;

    headerActions.appendChild(editButton);

    // 編集メニュー
    const menu = document.createElement("div");
    menu.id = "listIndexEditMenu";
    menu.hidden = true;

    const newList = document.createElement("button");
    newList.type = "button";
    newList.className = "btn small subtle";
    newList.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      <span>新しいリストを作成</span>
    `;

    const importWords = document.createElement("button");
    importWords.type = "button";
    importWords.className = "btn small subtle";
    importWords.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M12 16V3M7 8l5-5 5 5"/>
        <path d="M4 16v4h16v-4"/>
      </svg>
      <span>単語をインポート</span>
    `;

    menu.append(newList, importWords);

    const searchPanel = document.getElementById("globalSearchPanel");
    if (searchPanel) {
      searchPanel.after(menu);
    } else {
      headerActions.parentElement.after(menu);
    }

    function closeMenu() {
      menu.hidden = true;
      editButton.setAttribute("aria-expanded", "false");
    }

    editButton.addEventListener("click", () => {
      menu.hidden = !menu.hidden;
      editButton.setAttribute(
        "aria-expanded",
        String(!menu.hidden)
      );
    });

    newList.addEventListener("click", () => {
      closeMenu();
      if (typeof window.openCreateList === "function") {
        window.openCreateList();
      }
    });

    importWords.addEventListener("click", () => {
      closeMenu();
      if (typeof window.openImport === "function") {
        window.openImport();
      }
    });

    // メニュー外をタップしたら閉じる
    document.addEventListener("click", event => {
      if (!menu.contains(event.target) &&
          !editButton.contains(event.target)) {
        closeMenu();
      }
    });

    // 一覧下部にあったインポートボタンだけを非表示
    const bottomImport = [...view.querySelectorAll("button")]
      .find(button =>
        button.getAttribute("onclick") === "openImport()" &&
        button.textContent.includes("単語をインポート")
      );

    if (bottomImport) {
      bottomImport.hidden = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }
})();
