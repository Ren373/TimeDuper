// ==UserScript==
// @name         TimeDuper Phase 0
// @namespace    https://github.com/timeduper
// @version      0.2.0
// @description  Instagram WebのReelsとExploreを、端末内設定で個別にブロックする実証版
// @match        https://www.instagram.com/*
// @run-at       document-start
// @inject-into  content
// @grant        GM.getValue
// @grant        GM.setValue
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_NAME = 'TimeDuper Phase 1';
  const STYLE_ID = 'timeduper-phase1-style';
  const HIDDEN_ATTRIBUTE = 'data-timeduper-hidden';
  const INSTANCE_ATTRIBUTE = 'data-timeduper-phase01-active';
  const BLOCK_REELS_ATTRIBUTE = 'data-timeduper-block-reels';
  const BLOCK_EXPLORE_ATTRIBUTE = 'data-timeduper-block-explore';
  const UI_ROOT_ID = 'timeduper-settings-root';
  const UI_PANEL_ID = 'timeduper-settings-panel';
  const UI_TITLE_ID = 'timeduper-settings-title';
  const UI_OPEN_BUTTON_ID = 'timeduper-settings-open';
  const UI_CLOSE_BUTTON_ID = 'timeduper-settings-close';
  const UI_REELS_INPUT_ID = 'timeduper-block-reels';
  const UI_EXPLORE_INPUT_ID = 'timeduper-block-explore';
  const STORAGE_KEY = 'timeduper.settings.v1';
  const SETTINGS_SCHEMA_VERSION = 1;
  const URL_POLL_INTERVAL_MS = 1500;
  const NAVIGATION_DISCOVERY_WINDOW_MS = 10000;

  const DEFAULT_SETTINGS = Object.freeze({
    blockReels: true,
    blockExplore: true,
  });

  const NAVIGATION_ROOT_SELECTOR = 'nav, [role="navigation"]';
  const NAVIGATION_CONTROL_SELECTOR = [
    'a[href]',
    'button',
    '[role="link"]',
    '[role="button"]',
    '[role="menuitem"]',
  ].join(',');

  // ラベルは、主要ナビゲーション内の非リンク型コントロールに限る最終フォールバック。
  // Search/検索は汎用的すぎるため、ラベルだけでは一切ブロックしない。
  const NAVIGATION_FALLBACK_LABELS = new Map([
    ['reels', 'reels'],
    ['reel', 'reels'],
    ['リール', 'reels'],
    ['リール動画', 'reels'],
    ['explore', 'explore'],
    ['発見', 'explore'],
  ]);

  const REELS_LINK_SELECTORS = [
    'a[href="/reel"]',
    'a[href^="/reel/"]',
    'a[href^="/reel?"]',
    'a[href="/reels"]',
    'a[href^="/reels/"]',
    'a[href^="/reels?"]',
    'a[href="https://www.instagram.com/reel"]',
    'a[href^="https://www.instagram.com/reel/"]',
    'a[href^="https://www.instagram.com/reel?"]',
    'a[href="https://www.instagram.com/reels"]',
    'a[href^="https://www.instagram.com/reels/"]',
    'a[href^="https://www.instagram.com/reels?"]',
  ];

  const EXPLORE_LINK_SELECTORS = [
    'a[href="/explore"]',
    'a[href^="/explore/"]',
    'a[href^="/explore?"]',
    'a[href="https://www.instagram.com/explore"]',
    'a[href^="https://www.instagram.com/explore/"]',
    'a[href^="https://www.instagram.com/explore?"]',
  ];

  function scopedSelectors(attribute, selectors) {
    return selectors
      .map((selector) => `html[${attribute}="true"] ${selector}`)
      .join(',\n    ');
  }

  const CSS = `
    ${scopedSelectors(BLOCK_REELS_ATTRIBUTE, REELS_LINK_SELECTORS)},
    html[${BLOCK_REELS_ATTRIBUTE}="true"] [${HIDDEN_ATTRIBUTE}="reels"] {
      display: none !important;
    }

    ${scopedSelectors(BLOCK_EXPLORE_ATTRIBUTE, EXPLORE_LINK_SELECTORS)},
    html[${BLOCK_EXPLORE_ATTRIBUTE}="true"] [${HIDDEN_ATTRIBUTE}="explore"] {
      display: none !important;
    }

    #${UI_ROOT_ID} {
      all: initial !important;
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483000 !important;
      pointer-events: none !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      color: #171717 !important;
    }

    #${UI_ROOT_ID},
    #${UI_ROOT_ID} * {
      box-sizing: border-box !important;
    }

    #${UI_OPEN_BUTTON_ID} {
      position: fixed !important;
      right: max(12px, env(safe-area-inset-right, 0px)) !important;
      bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important;
      width: 46px !important;
      height: 46px !important;
      padding: 0 !important;
      border: 1px solid rgba(0, 0, 0, 0.18) !important;
      border-radius: 50% !important;
      background: #ffffff !important;
      color: #171717 !important;
      box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2) !important;
      font: 700 14px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      text-align: center !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      -webkit-tap-highlight-color: transparent !important;
    }

    #${UI_PANEL_ID} {
      position: fixed !important;
      right: max(12px, env(safe-area-inset-right, 0px)) !important;
      bottom: calc(126px + env(safe-area-inset-bottom, 0px)) !important;
      width: min(300px, calc(100vw - 24px)) !important;
      padding: 16px !important;
      border: 1px solid rgba(0, 0, 0, 0.18) !important;
      border-radius: 14px !important;
      background: #ffffff !important;
      color: #171717 !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.24) !important;
      pointer-events: auto !important;
    }

    #${UI_PANEL_ID}[hidden] {
      display: none !important;
    }

    .timeduper-settings-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      margin: 0 0 10px !important;
    }

    #${UI_TITLE_ID} {
      margin: 0 !important;
      color: inherit !important;
      font: 700 18px/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }

    #${UI_CLOSE_BUTTON_ID} {
      min-width: 44px !important;
      min-height: 44px !important;
      padding: 8px !important;
      border: 0 !important;
      border-radius: 9px !important;
      background: #efefef !important;
      color: inherit !important;
      font: 600 14px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      -webkit-tap-highlight-color: transparent !important;
    }

    .timeduper-settings-row {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 16px !important;
      min-height: 52px !important;
      margin: 0 !important;
      padding: 6px 0 !important;
      border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
      color: inherit !important;
      font: 500 16px/1.3 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      cursor: pointer !important;
    }

    .timeduper-settings-switch {
      flex: 0 0 auto !important;
      width: 28px !important;
      height: 28px !important;
      margin: 0 8px !important;
      accent-color: #0095f6 !important;
      pointer-events: auto !important;
    }

    #${UI_ROOT_ID} button:focus-visible,
    #${UI_ROOT_ID} input:focus-visible {
      outline: 3px solid #0095f6 !important;
      outline-offset: 2px !important;
    }

    #${UI_ROOT_ID} input:disabled {
      opacity: 0.55 !important;
    }

    @media (prefers-color-scheme: dark) {
      #${UI_OPEN_BUTTON_ID},
      #${UI_PANEL_ID} {
        border-color: rgba(255, 255, 255, 0.22) !important;
        background: #1f1f1f !important;
        color: #f5f5f5 !important;
      }

      #${UI_CLOSE_BUTTON_ID} {
        background: #363636 !important;
      }

      .timeduper-settings-row {
        border-top-color: rgba(255, 255, 255, 0.14) !important;
      }
    }
  `;

  let instanceClaimed = false;
  let redirectInProgress = false;
  let lastSeenUrl = window.location.href;
  let domObserver = null;
  let observerMode = 'idle';
  let urlPollTimer = null;
  let discoveryTimer = null;
  let navigationRefreshFrame = null;
  let navigationScanFrame = null;
  let navigationRoots = new Set();
  let navigationParents = new Set();
  let settings = { ...DEFAULT_SETTINGS };
  let settingsSaveInProgress = false;
  let uiRoot = null;
  let uiMountPending = false;
  const pendingNavigationNodes = new Map();

  function warn(error) {
    // 例外時はInstagramの通常動作を優先し、情報の保存や送信は行わない。
    console.warn(`[${SCRIPT_NAME}]`, error);
  }

  function normalizeStoredSettings(value) {
    if (!value
      || typeof value !== 'object'
      || value.schemaVersion !== SETTINGS_SCHEMA_VERSION
      || typeof value.blockReels !== 'boolean'
      || typeof value.blockExplore !== 'boolean') {
      return { ...DEFAULT_SETTINGS };
    }

    return {
      blockReels: value.blockReels,
      blockExplore: value.blockExplore,
    };
  }

  function createStoragePayload(value) {
    return {
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      blockReels: value.blockReels === true,
      blockExplore: value.blockExplore === true,
    };
  }

  // Userscripts固有APIをこの薄い層に閉じ込め、将来の保存先差し替えを容易にする。
  const StorageAdapter = Object.freeze({
    async load() {
      if (typeof GM !== 'object' || typeof GM.getValue !== 'function') {
        throw new Error('GM.getValue is unavailable');
      }
      const stored = await GM.getValue(STORAGE_KEY, null);
      return normalizeStoredSettings(stored);
    },

    async save(value) {
      if (typeof GM !== 'object' || typeof GM.setValue !== 'function') {
        throw new Error('GM.setValue is unavailable');
      }
      await GM.setValue(STORAGE_KEY, createStoragePayload(value));
    },
  });

  async function loadSettingsWithFallback() {
    try {
      return await StorageAdapter.load();
    } catch (error) {
      warn(error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  function isBlockingKind(kind) {
    return (kind === 'reels' && settings.blockReels)
      || (kind === 'explore' && settings.blockExplore);
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

  function toSameOriginUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      return url.origin === window.location.origin ? url : null;
    } catch (error) {
      return null;
    }
  }

  function classifyUrl(value) {
    const url = toSameOriginUrl(value);
    return url ? classifyPath(url.pathname) : null;
  }

  function blockCurrentRouteIfNeeded() {
    if (!settings.blockReels
      || classifyPath(window.location.pathname) !== 'reels'
      || redirectInProgress) {
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

  function claimInstance() {
    const root = document.documentElement;
    if (!root || root.hasAttribute(INSTANCE_ATTRIBUTE)) {
      return false;
    }

    root.setAttribute(INSTANCE_ATTRIBUTE, 'true');
    instanceClaimed = true;
    return true;
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

  function removeMarkersByKind(kind) {
    document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}="${kind}"]`).forEach((element) => {
      element.removeAttribute(HIDDEN_ATTRIBUTE);
    });
  }

  function syncSettingsUi() {
    if (!uiRoot || !uiRoot.isConnected) {
      return;
    }

    const reelsInput = uiRoot.querySelector(`#${UI_REELS_INPUT_ID}`);
    const exploreInput = uiRoot.querySelector(`#${UI_EXPLORE_INPUT_ID}`);
    const panel = uiRoot.querySelector(`#${UI_PANEL_ID}`);

    if (reelsInput instanceof HTMLInputElement) {
      reelsInput.checked = settings.blockReels;
      reelsInput.disabled = settingsSaveInProgress;
    }
    if (exploreInput instanceof HTMLInputElement) {
      exploreInput.checked = settings.blockExplore;
      exploreInput.disabled = settingsSaveInProgress;
    }
    if (panel) {
      panel.setAttribute('aria-busy', settingsSaveInProgress ? 'true' : 'false');
    }
  }

  function applySettingsToPage({ blockCurrentRoute = false } = {}) {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    root.setAttribute(BLOCK_REELS_ATTRIBUTE, settings.blockReels ? 'true' : 'false');
    root.setAttribute(BLOCK_EXPLORE_ATTRIBUTE, settings.blockExplore ? 'true' : 'false');

    if (!settings.blockReels) {
      redirectInProgress = false;
      removeMarkersByKind('reels');
    }
    if (!settings.blockExplore) {
      removeMarkersByKind('explore');
    }

    navigationRoots.forEach((navigationRoot) => {
      processNavigationSubtree(navigationRoot, navigationRoot);
    });
    if (domObserver && (settings.blockReels || settings.blockExplore)) {
      scheduleNavigationRefresh();
    }
    syncSettingsUi();

    if (blockCurrentRoute && settings.blockReels) {
      blockCurrentRouteIfNeeded();
    }
  }

  function focusWithoutScrolling(element) {
    try {
      element.focus({ preventScroll: true });
    } catch (error) {
      element.focus();
    }
  }

  function openSettingsPanel() {
    if (!uiRoot) {
      return;
    }

    const panel = uiRoot.querySelector(`#${UI_PANEL_ID}`);
    const openButton = uiRoot.querySelector(`#${UI_OPEN_BUTTON_ID}`);
    const closeButton = uiRoot.querySelector(`#${UI_CLOSE_BUTTON_ID}`);
    if (!panel || !openButton || !closeButton) {
      return;
    }

    panel.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    focusWithoutScrolling(closeButton);
  }

  function closeSettingsPanel() {
    if (!uiRoot) {
      return;
    }

    const panel = uiRoot.querySelector(`#${UI_PANEL_ID}`);
    const openButton = uiRoot.querySelector(`#${UI_OPEN_BUTTON_ID}`);
    if (!panel || !openButton) {
      return;
    }

    panel.hidden = true;
    openButton.setAttribute('aria-expanded', 'false');
    focusWithoutScrolling(openButton);
  }

  async function updateSetting(key, enabled) {
    if (settingsSaveInProgress
      || !Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, key)) {
      syncSettingsUi();
      return;
    }

    const previousSettings = { ...settings };
    settings = { ...settings, [key]: enabled === true };
    settingsSaveInProgress = true;

    try {
      applySettingsToPage();
      await StorageAdapter.save(settings);
      applySettingsToPage({ blockCurrentRoute: true });
    } catch (error) {
      warn(error);
      settings = previousSettings;
      try {
        applySettingsToPage();
      } catch (restoreError) {
        warn(restoreError);
      }
    } finally {
      settingsSaveInProgress = false;
      syncSettingsUi();
    }
  }

  function handleSettingsUiClick(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest('button');
    if (!button || !uiRoot || !uiRoot.contains(button)) {
      return;
    }

    if (button.id === UI_OPEN_BUTTON_ID) {
      openSettingsPanel();
    } else if (button.id === UI_CLOSE_BUTTON_ID) {
      closeSettingsPanel();
    }
  }

  function handleSettingsUiChange(event) {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'checkbox') {
      return;
    }

    if (event.target.id === UI_REELS_INPUT_ID) {
      void updateSetting('blockReels', event.target.checked);
    } else if (event.target.id === UI_EXPLORE_INPUT_ID) {
      void updateSetting('blockExplore', event.target.checked);
    }
  }

  function handleSettingsUiKeydown(event) {
    if (event.key === 'Escape') {
      closeSettingsPanel();
    }
  }

  function createSettingsRow(inputId, labelText, ariaLabel) {
    const row = document.createElement('label');
    row.className = 'timeduper-settings-row';
    row.htmlFor = inputId;

    const text = document.createElement('span');
    text.className = 'timeduper-settings-label';
    text.textContent = labelText;

    const input = document.createElement('input');
    input.id = inputId;
    input.className = 'timeduper-settings-switch';
    input.type = 'checkbox';
    input.setAttribute('role', 'switch');
    input.setAttribute('aria-label', ariaLabel);

    row.append(text, input);
    return row;
  }

  function handleUiMountReady() {
    uiMountPending = false;
    ensureSettingsUi();
  }

  function ensureSettingsUi() {
    if (uiRoot && uiRoot.isConnected) {
      syncSettingsUi();
      return;
    }

    const existing = document.getElementById(UI_ROOT_ID);
    if (existing) {
      uiRoot = existing;
      syncSettingsUi();
      return;
    }

    if (!document.body) {
      if (!uiMountPending) {
        uiMountPending = true;
        document.addEventListener('DOMContentLoaded', handleUiMountReady, { once: true });
      }
      return;
    }

    const root = document.createElement('div');
    root.id = UI_ROOT_ID;
    root.setAttribute('data-timeduper-ui', 'true');

    const openButton = document.createElement('button');
    openButton.id = UI_OPEN_BUTTON_ID;
    openButton.type = 'button';
    openButton.textContent = 'TD';
    openButton.setAttribute('aria-label', 'Open TimeDuper settings');
    openButton.setAttribute('aria-haspopup', 'dialog');
    openButton.setAttribute('aria-controls', UI_PANEL_ID);
    openButton.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('section');
    panel.id = UI_PANEL_ID;
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', UI_TITLE_ID);
    panel.setAttribute('aria-busy', 'false');

    const header = document.createElement('div');
    header.className = 'timeduper-settings-header';

    const title = document.createElement('h2');
    title.id = UI_TITLE_ID;
    title.textContent = 'TimeDuper';

    const closeButton = document.createElement('button');
    closeButton.id = UI_CLOSE_BUTTON_ID;
    closeButton.type = 'button';
    closeButton.textContent = 'Close';
    closeButton.setAttribute('aria-label', 'Close TimeDuper settings');

    header.append(title, closeButton);
    panel.append(
      header,
      createSettingsRow(UI_REELS_INPUT_ID, 'Block Reels', 'Block Reels'),
      createSettingsRow(UI_EXPLORE_INPUT_ID, 'Block Explore', 'Block Explore'),
    );
    root.append(openButton, panel);
    root.addEventListener('click', handleSettingsUiClick);
    root.addEventListener('change', handleSettingsUiChange);
    root.addEventListener('keydown', handleSettingsUiKeydown);
    document.body.appendChild(root);
    uiRoot = root;
    syncSettingsUi();
  }

  function isKnownPrimaryNavigationPath(pathname) {
    return pathname === '/'
      || pathname === '/direct'
      || pathname.startsWith('/direct/')
      || pathname === '/accounts/activity'
      || pathname.startsWith('/accounts/activity/')
      || pathname === '/notifications'
      || pathname.startsWith('/notifications/')
      || classifyPath(pathname) !== null;
  }

  function isLikelyPrimaryNavigation(root) {
    if (!(root instanceof Element)
      || !root.isConnected
      || root.closest(`#${UI_ROOT_ID}`)
      || !root.matches(NAVIGATION_ROOT_SELECTOR)) {
      return false;
    }

    const controls = root.querySelectorAll(NAVIGATION_CONTROL_SELECTOR);
    if (controls.length < 3) {
      return false;
    }

    let hasHome = false;
    let hasSecondaryRoute = false;
    const links = root.querySelectorAll('a[href], [role="link"][href]');

    for (const link of links) {
      const url = toSameOriginUrl(link.getAttribute('href'));
      if (!url) {
        continue;
      }

      if (url.pathname === '/') {
        hasHome = true;
      } else if (isKnownPrimaryNavigationPath(url.pathname)) {
        hasSecondaryRoute = true;
      }

      if (hasHome && hasSecondaryRoute) {
        return true;
      }
    }

    return false;
  }

  function findPrimaryNavigationRoots(scope) {
    const candidates = new Set();

    if (scope instanceof Element && scope.matches(NAVIGATION_ROOT_SELECTOR)) {
      candidates.add(scope);
    }

    if (scope instanceof Element) {
      const ancestor = scope.closest(NAVIGATION_ROOT_SELECTOR);
      if (ancestor) {
        candidates.add(ancestor);
      }
      scope.querySelectorAll(NAVIGATION_ROOT_SELECTOR).forEach((root) => candidates.add(root));
    }

    return Array.from(candidates).filter(isLikelyPrimaryNavigation);
  }

  function classifyFallbackLabel(control) {
    const labelledElements = [control, ...control.querySelectorAll('[aria-label], [title]')];

    for (const element of labelledElements) {
      // 入れ子になった別コントロールのラベルを親コントロールの根拠にしない。
      if (element !== control && element.closest(NAVIGATION_CONTROL_SELECTOR) !== control) {
        continue;
      }

      const values = [element.getAttribute('aria-label'), element.getAttribute('title')];
      for (const value of values) {
        const normalized = (value || '').trim().toLowerCase();
        if (NAVIGATION_FALLBACK_LABELS.has(normalized)) {
          return NAVIGATION_FALLBACK_LABELS.get(normalized);
        }
      }
    }

    return null;
  }

  function classifyNavigationControl(control, navigationRoot) {
    // URL/hrefが常に最優先。ラベルは主要ナビゲーション確認後だけ利用する。
    const routeKind = classifyUrl(control.getAttribute('href'));
    if (routeKind) {
      return isBlockingKind(routeKind) ? routeKind : null;
    }

    if (!navigationRoots.has(navigationRoot) || !navigationRoot.contains(control)) {
      return null;
    }

    const fallbackKind = classifyFallbackLabel(control);
    return isBlockingKind(fallbackKind) ? fallbackKind : null;
  }

  function reconcileNavigationControl(control, navigationRoot) {
    if (!(control instanceof Element) || !navigationRoot.contains(control)) {
      return;
    }

    const kind = classifyNavigationControl(control, navigationRoot);
    if (kind) {
      control.setAttribute(HIDDEN_ATTRIBUTE, kind);
    } else if (control.hasAttribute(HIDDEN_ATTRIBUTE)) {
      control.removeAttribute(HIDDEN_ATTRIBUTE);
    }
  }

  function processNavigationSubtree(node, navigationRoot) {
    if (!(node instanceof Element) || !node.isConnected || !navigationRoot.contains(node)) {
      return;
    }

    try {
      const controls = new Set();
      const closestControl = node.closest(NAVIGATION_CONTROL_SELECTOR);

      if (closestControl && navigationRoot.contains(closestControl)) {
        controls.add(closestControl);
      }
      if (node.matches(NAVIGATION_CONTROL_SELECTOR)) {
        controls.add(node);
      }
      node.querySelectorAll(NAVIGATION_CONTROL_SELECTOR).forEach((control) => controls.add(control));

      controls.forEach((control) => reconcileNavigationControl(control, navigationRoot));
    } catch (error) {
      warn(error);
    }
  }

  function flushNavigationNodes() {
    navigationScanFrame = null;
    const batches = Array.from(pendingNavigationNodes.entries());
    pendingNavigationNodes.clear();

    for (const [navigationRoot, nodes] of batches) {
      if (!navigationRoot.isConnected || !navigationRoots.has(navigationRoot)) {
        continue;
      }
      nodes.forEach((node) => processNavigationSubtree(node, navigationRoot));
    }
  }

  function queueNavigationNode(navigationRoot, node) {
    if (!(node instanceof Element) || !navigationRoot.contains(node)) {
      return;
    }

    let nodes = pendingNavigationNodes.get(navigationRoot);
    if (!nodes) {
      nodes = new Set();
      pendingNavigationNodes.set(navigationRoot, nodes);
    }

    for (const queued of nodes) {
      if (queued.contains(node)) {
        return;
      }
      if (node.contains(queued)) {
        nodes.delete(queued);
      }
    }

    nodes.add(node);
    if (navigationScanFrame === null) {
      navigationScanFrame = window.requestAnimationFrame(flushNavigationNodes);
    }
  }

  function removeMarkersFromRoot(root) {
    if (!(root instanceof Element)) {
      return;
    }

    if (root.hasAttribute(HIDDEN_ATTRIBUTE)) {
      root.removeAttribute(HIDDEN_ATTRIBUTE);
    }
    root.querySelectorAll(`[${HIDDEN_ATTRIBUTE}]`).forEach((element) => {
      element.removeAttribute(HIDDEN_ATTRIBUTE);
    });
  }

  function clearDiscoveryTimer() {
    if (discoveryTimer !== null) {
      window.clearTimeout(discoveryTimer);
      discoveryTimer = null;
    }
  }

  function beginNavigationDiscovery() {
    if (!domObserver || !document.documentElement) {
      return;
    }

    navigationRoots.forEach(removeMarkersFromRoot);
    navigationRoots = new Set();
    navigationParents = new Set();
    pendingNavigationNodes.clear();
    domObserver.disconnect();
    observerMode = 'discovery';

    // 全document監視は主要navを探す短い期間だけ。処理対象はaddedNodes内のnav候補のみ。
    domObserver.observe(document.documentElement, {
      subtree: true,
      childList: true,
    });

    clearDiscoveryTimer();
    discoveryTimer = window.setTimeout(() => {
      if (observerMode === 'discovery') {
        domObserver.disconnect();
        observerMode = 'idle';
      }
      discoveryTimer = null;
    }, NAVIGATION_DISCOVERY_WINDOW_MS);
  }

  function attachNavigationObservers(roots) {
    if (!domObserver || roots.length === 0) {
      beginNavigationDiscovery();
      return;
    }

    clearDiscoveryTimer();
    domObserver.disconnect();
    observerMode = 'navigation';

    const nextRoots = new Set(roots);
    navigationRoots.forEach((root) => {
      if (!nextRoots.has(root)) {
        removeMarkersFromRoot(root);
      }
    });

    navigationRoots = nextRoots;
    navigationParents = new Set();
    pendingNavigationNodes.clear();

    navigationRoots.forEach((root) => {
      processNavigationSubtree(root, root);
      domObserver.observe(root, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['href', 'aria-label', 'title', 'role'],
      });

      if (root.parentElement && !navigationRoots.has(root.parentElement)) {
        navigationParents.add(root.parentElement);
      }
    });

    navigationParents.forEach((parent) => {
      domObserver.observe(parent, { childList: true });
    });
  }

  function refreshNavigationMonitoring() {
    navigationRefreshFrame = null;
    if (!document.documentElement) {
      return;
    }

    try {
      const roots = findPrimaryNavigationRoots(document.documentElement);
      if (roots.length > 0) {
        attachNavigationObservers(roots);
      } else {
        beginNavigationDiscovery();
      }
    } catch (error) {
      warn(error);
      beginNavigationDiscovery();
    }
  }

  function scheduleNavigationRefresh() {
    if (navigationRefreshFrame === null) {
      navigationRefreshFrame = window.requestAnimationFrame(refreshNavigationMonitoring);
    }
  }

  function findTrackedNavigation(element) {
    for (const root of navigationRoots) {
      if (root === element || root.contains(element)) {
        return root;
      }
    }
    return null;
  }

  function addedNodeContainsPrimaryNavigation(node) {
    if (!(node instanceof Element)) {
      return false;
    }
    return findPrimaryNavigationRoots(node).length > 0;
  }

  function handleDiscoveryMutations(mutations) {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (addedNodeContainsPrimaryNavigation(node)) {
          scheduleNavigationRefresh();
          return;
        }
      }
    }
  }

  function handleNavigationMutations(mutations) {
    let refreshNeeded = false;

    for (const mutation of mutations) {
      const navigationRoot = mutation.target instanceof Element
        ? findTrackedNavigation(mutation.target)
        : null;

      if (navigationRoot) {
        if (mutation.type === 'attributes') {
          if (mutation.target === navigationRoot && mutation.attributeName === 'role') {
            refreshNeeded = true;
          } else {
            queueNavigationNode(navigationRoot, mutation.target);
          }
        } else {
          // nav外へ再利用される要素を誤って隠し続けないよう、切り離し時に印を外す。
          for (const node of mutation.removedNodes) {
            removeMarkersFromRoot(node);
          }
          for (const node of mutation.addedNodes) {
            queueNavigationNode(navigationRoot, node);
          }
        }
        continue;
      }

      if (mutation.type !== 'childList' || !(mutation.target instanceof Element)) {
        continue;
      }

      if (navigationParents.has(mutation.target)) {
        for (const node of mutation.removedNodes) {
          if (node instanceof Element) {
            for (const root of navigationRoots) {
              if (node === root || node.contains(root)) {
                removeMarkersFromRoot(node);
                refreshNeeded = true;
                break;
              }
            }
          }
        }

        for (const node of mutation.addedNodes) {
          if (addedNodeContainsPrimaryNavigation(node)) {
            refreshNeeded = true;
            break;
          }
        }
      }
    }

    if (!refreshNeeded) {
      refreshNeeded = Array.from(navigationRoots).some((root) => !root.isConnected);
    }
    if (refreshNeeded) {
      scheduleNavigationRefresh();
    }
  }

  function handleMutations(mutations) {
    try {
      installStyle();
      checkForUrlChange();

      if (observerMode === 'discovery') {
        handleDiscoveryMutations(mutations);
      } else if (observerMode === 'navigation') {
        handleNavigationMutations(mutations);
      }
    } catch (error) {
      warn(error);
    }
  }

  function ensureNavigationHealth() {
    if (navigationRoots.size > 0
      && Array.from(navigationRoots).some((root) => !root.isConnected)) {
      scheduleNavigationRefresh();
    }
  }

  function checkForUrlChange() {
    if (window.location.href === lastSeenUrl) {
      return false;
    }

    lastSeenUrl = window.location.href;
    const blocked = blockCurrentRouteIfNeeded();
    if (!blocked) {
      scheduleNavigationRefresh();
    }
    return true;
  }

  function pollUrlFallback() {
    if (document.visibilityState !== 'visible') {
      return;
    }

    try {
      installStyle();
      ensureSettingsUi();
      checkForUrlChange();
      ensureNavigationHealth();
    } catch (error) {
      warn(error);
    }
  }

  function startUrlPolling() {
    if (urlPollTimer === null && document.visibilityState === 'visible') {
      urlPollTimer = window.setInterval(pollUrlFallback, URL_POLL_INTERVAL_MS);
    }
  }

  function stopUrlPolling() {
    if (urlPollTimer !== null) {
      window.clearInterval(urlPollTimer);
      urlPollTimer = null;
    }
  }

  function handleClick(event) {
    try {
      if (uiRoot && event.target instanceof Node && uiRoot.contains(event.target)) {
        return;
      }

      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      const link = path.find((node) => node instanceof HTMLAnchorElement)
        || (event.target instanceof Element ? event.target.closest('a[href]') : null);

      if (!settings.blockReels || !link || classifyUrl(link.href) !== 'reels') {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
    } catch (error) {
      warn(error);
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      stopUrlPolling();
      return;
    }

    installStyle();
    ensureSettingsUi();
    checkForUrlChange();
    scheduleNavigationRefresh();
    startUrlPolling();
  }

  function handlePageShow() {
    installStyle();
    ensureSettingsUi();
    checkForUrlChange();
    scheduleNavigationRefresh();
    startUrlPolling();
  }

  function handleHistorySignal() {
    checkForUrlChange();
  }

  function cleanup() {
    stopUrlPolling();
    clearDiscoveryTimer();

    if (domObserver) {
      domObserver.disconnect();
    }
    if (navigationRefreshFrame !== null) {
      window.cancelAnimationFrame(navigationRefreshFrame);
      navigationRefreshFrame = null;
    }
    if (navigationScanFrame !== null) {
      window.cancelAnimationFrame(navigationScanFrame);
      navigationScanFrame = null;
    }

    pendingNavigationNodes.clear();
    navigationRoots.forEach(removeMarkersFromRoot);
    navigationRoots.clear();
    navigationParents.clear();

    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('popstate', handleHistorySignal);
    window.removeEventListener('hashchange', handleHistorySignal);
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('pagehide', handlePageHide);
    document.removeEventListener('DOMContentLoaded', handleUiMountReady);
    document.removeEventListener('DOMContentLoaded', handleBootstrapReady);

    if (uiRoot) {
      uiRoot.removeEventListener('click', handleSettingsUiClick);
      uiRoot.removeEventListener('change', handleSettingsUiChange);
      uiRoot.removeEventListener('keydown', handleSettingsUiKeydown);
      uiRoot.remove();
      uiRoot = null;
    }
    uiMountPending = false;

    const style = document.getElementById(STYLE_ID);
    if (style) {
      style.remove();
    }

    if (instanceClaimed && document.documentElement) {
      document.documentElement.removeAttribute(BLOCK_REELS_ATTRIBUTE);
      document.documentElement.removeAttribute(BLOCK_EXPLORE_ATTRIBUTE);
      document.documentElement.removeAttribute(INSTANCE_ATTRIBUTE);
      instanceClaimed = false;
    }

    observerMode = 'idle';
  }

  function handlePageHide(event) {
    stopUrlPolling();
    if (!event.persisted) {
      cleanup();
    }
  }

  function startRuntime() {
    try {
      installStyle();
      applySettingsToPage();
      ensureSettingsUi();
      domObserver = new MutationObserver(handleMutations);
      scheduleNavigationRefresh();

      document.addEventListener('click', handleClick, true);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('popstate', handleHistorySignal);
      window.addEventListener('hashchange', handleHistorySignal);
      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('pagehide', handlePageHide);

      startUrlPolling();
    } catch (error) {
      // 初期化に失敗した場合は登録済み処理を解除し、Instagramを通常表示へ戻す。
      warn(error);
      cleanup();
    }
  }

  async function bootstrap() {
    if (!document.documentElement || !claimInstance()) {
      return;
    }

    try {
      settings = await loadSettingsWithFallback();
      applySettingsToPage();

      if (blockCurrentRouteIfNeeded()) {
        return;
      }

      startRuntime();
    } catch (error) {
      warn(error);
      cleanup();
    }
  }

  function handleBootstrapReady() {
    void bootstrap();
  }

  try {
    if (document.documentElement) {
      void bootstrap();
    } else {
      document.addEventListener('DOMContentLoaded', handleBootstrapReady, { once: true });
    }
  } catch (error) {
    warn(error);
  }
})();
