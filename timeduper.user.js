// ==UserScript==
// @name         TimeDuper Phase 0
// @namespace    https://github.com/timeduper
// @version      0.1.0
// @description  Instagram WebのReelsをブロックし、ReelsとExploreへの入口を隠す最小実証版
// @match        https://www.instagram.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_NAME = 'TimeDuper Phase 0';
  const STYLE_ID = 'timeduper-phase0-style';
  const HIDDEN_ATTRIBUTE = 'data-timeduper-hidden';
  const URL_POLL_INTERVAL_MS = 500;

  const BLOCKED_LABELS = new Map([
    ['reels', 'reels'],
    ['reel', 'reels'],
    ['リール', 'reels'],
    ['リール動画', 'reels'],
    ['explore', 'explore'],
    ['search', 'explore'],
    ['検索', 'explore'],
    ['発見', 'explore'],
  ]);

  const ROUTE_ELEMENT_SELECTOR = [
    '[href="/reel"]',
    '[href^="/reel/"]',
    '[href^="/reel?"]',
    '[href="/reels"]',
    '[href^="/reels/"]',
    '[href^="/reels?"]',
    '[href="/explore"]',
    '[href^="/explore/"]',
    '[href^="/explore?"]',
    '[href="https://www.instagram.com/reel"]',
    '[href^="https://www.instagram.com/reel/"]',
    '[href^="https://www.instagram.com/reel?"]',
    '[href="https://www.instagram.com/reels"]',
    '[href^="https://www.instagram.com/reels/"]',
    '[href^="https://www.instagram.com/reels?"]',
    '[href="https://www.instagram.com/explore"]',
    '[href^="https://www.instagram.com/explore/"]',
    '[href^="https://www.instagram.com/explore?"]',
  ].join(',');

  const LABEL_ELEMENT_SELECTOR = [
    'nav [aria-label]',
    'nav [title]',
    '[role="navigation"] [aria-label]',
    '[role="navigation"] [title]',
    '[role="menu"] [aria-label]',
    '[role="menu"] [title]',
    'header [aria-label]',
    'header [title]',
  ].join(',');

  const CSS = `
    [${HIDDEN_ATTRIBUTE}] {
      display: none !important;
    }

    a[href="/reel"],
    a[href^="/reel/"],
    a[href^="/reel?"],
    a[href="/reels"],
    a[href^="/reels/"],
    a[href^="/reels?"],
    a[href="/explore"],
    a[href^="/explore/"],
    a[href^="/explore?"],
    a[href="https://www.instagram.com/reel"],
    a[href^="https://www.instagram.com/reel/"],
    a[href^="https://www.instagram.com/reel?"],
    a[href="https://www.instagram.com/reels"],
    a[href^="https://www.instagram.com/reels/"],
    a[href^="https://www.instagram.com/reels?"],
    a[href="https://www.instagram.com/explore"],
    a[href^="https://www.instagram.com/explore/"],
    a[href^="https://www.instagram.com/explore?"] {
      display: none !important;
    }
  `;

  let observer = null;
  let lastSeenUrl = window.location.href;
  let redirectInProgress = false;
  let scanScheduled = false;
  const pendingRoots = new Set();

  function warn(error) {
    // ログ以外の復旧処理は行わず、Instagramを通常どおり使える状態を優先する。
    console.warn(`[${SCRIPT_NAME}]`, error);
  }

  function classifyPath(pathname) {
    const path = pathname.toLowerCase();

    if (path === '/reel' || path.startsWith('/reel/')) {
      return 'reels';
    }

    if (path === '/reels' || path.startsWith('/reels/')) {
      return 'reels';
    }

    if (path === '/explore' || path.startsWith('/explore/')) {
      return 'explore';
    }

    return null;
  }

  function classifyUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      if (url.origin !== window.location.origin) {
        return null;
      }
      return classifyPath(url.pathname);
    } catch (error) {
      return null;
    }
  }

  function blockCurrentRouteIfNeeded() {
    if (classifyPath(window.location.pathname) !== 'reels' || redirectInProgress) {
      return false;
    }

    try {
      redirectInProgress = true;
      window.location.replace(`${window.location.origin}/`);
      return true;
    } catch (error) {
      redirectInProgress = false;
      warn(error);
      return false;
    }
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    try {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
    } catch (error) {
      warn(error);
    }
  }

  function markRouteElement(element) {
    const kind = classifyUrl(element.getAttribute('href'));
    if (kind) {
      element.setAttribute(HIDDEN_ATTRIBUTE, kind);
    } else if (element.hasAttribute(HIDDEN_ATTRIBUTE)) {
      // Instagramが同じDOM要素を別メニューとして再利用した場合に解除する。
      element.removeAttribute(HIDDEN_ATTRIBUTE);
    }
  }

  function markLabelElement(element) {
    const control = element.closest('a, button, [role="link"], [role="button"], [role="menuitem"]');
    if (!control) {
      return;
    }

    const labelledElements = [control, ...control.querySelectorAll('[aria-label], [title]')];
    let kind = classifyUrl(control.getAttribute('href'));

    for (const labelledElement of labelledElements) {
      const labels = [
        labelledElement.getAttribute('aria-label'),
        labelledElement.getAttribute('title'),
      ];

      for (const value of labels) {
        const normalized = (value || '').trim().toLowerCase();
        if (BLOCKED_LABELS.has(normalized)) {
          kind = BLOCKED_LABELS.get(normalized);
          break;
        }
      }

      if (kind) {
        break;
      }
    }

    if (kind) {
      control.setAttribute(HIDDEN_ATTRIBUTE, kind);
    } else {
      // ラベルが変わった再利用要素を誤って隠し続けない。
      control.removeAttribute(HIDDEN_ATTRIBUTE);
    }
  }

  function scanSubtree(root) {
    if (!(root instanceof Element) || !root.isConnected) {
      return;
    }

    try {
      if (root.hasAttribute('href')) {
        markRouteElement(root);
      }
      root.querySelectorAll(ROUTE_ELEMENT_SELECTOR).forEach(markRouteElement);

      if (root.closest('nav, [role="navigation"], [role="menu"], header')) {
        markLabelElement(root);
      }
      root.querySelectorAll(LABEL_ELEMENT_SELECTOR).forEach(markLabelElement);
    } catch (error) {
      warn(error);
    }
  }

  function flushPendingRoots() {
    scanScheduled = false;
    const roots = Array.from(pendingRoots);
    pendingRoots.clear();
    roots.forEach(scanSubtree);
  }

  function queueSubtree(root) {
    if (!(root instanceof Element)) {
      return;
    }

    for (const queued of pendingRoots) {
      if (queued.contains(root)) {
        return;
      }
      if (root.contains(queued)) {
        pendingRoots.delete(queued);
      }
    }

    pendingRoots.add(root);
    if (!scanScheduled) {
      scanScheduled = true;
      window.requestAnimationFrame(flushPendingRoots);
    }
  }

  function checkForUrlChange() {
    if (window.location.href === lastSeenUrl) {
      return;
    }

    lastSeenUrl = window.location.href;
    blockCurrentRouteIfNeeded();
  }

  function handleMutations(mutations) {
    try {
      installStyle();
      checkForUrlChange();

      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          queueSubtree(mutation.target);
          continue;
        }

        for (const node of mutation.addedNodes) {
          queueSubtree(node);
        }
      }
    } catch (error) {
      warn(error);
    }
  }

  function handleClick(event) {
    try {
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      const link = path.find((node) => node instanceof HTMLAnchorElement)
        || (event.target instanceof Element ? event.target.closest('a[href]') : null);

      if (!link || classifyUrl(link.href) !== 'reels') {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    } catch (error) {
      warn(error);
    }
  }

  function start() {
    if (!document.documentElement) {
      return;
    }

    try {
      installStyle();

      // 初回だけ現在のDOMを確認する。以後はMutationObserverで変更箇所だけを見る。
      scanSubtree(document.documentElement);

      observer = new MutationObserver(handleMutations);
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['href', 'aria-label', 'title', 'role'],
      });

      document.addEventListener('click', handleClick, true);
      window.addEventListener('popstate', checkForUrlChange);
      window.addEventListener('hashchange', checkForUrlChange);
      window.addEventListener('pageshow', checkForUrlChange);
      document.addEventListener('visibilitychange', checkForUrlChange);

      // pushState/replaceStateだけのSPA遷移を、履歴APIを書き換えず軽量に検出する。
      window.setInterval(() => {
        try {
          checkForUrlChange();
        } catch (error) {
          warn(error);
        }
      }, URL_POLL_INTERVAL_MS);
    } catch (error) {
      // 初期化に失敗してもInstagram側の処理は止めない（fail-open）。
      warn(error);
      if (observer) {
        observer.disconnect();
      }
    }
  }

  try {
    if (blockCurrentRouteIfNeeded()) {
      return;
    }

    if (document.documentElement) {
      start();
    } else {
      document.addEventListener('DOMContentLoaded', start, { once: true });
    }
  } catch (error) {
    warn(error);
  }
})();
