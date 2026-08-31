// ==UserScript==
// @name         TimeDuper Phase 0
// @namespace    https://github.com/timeduper
// @version      0.1.1
// @description  Instagram WebのReelsをブロックし、ReelsとExploreへの入口を隠す安定化実証版
// @match        https://www.instagram.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_NAME = 'TimeDuper Phase 0.1';
  const STYLE_ID = 'timeduper-phase0-style';
  const HIDDEN_ATTRIBUTE = 'data-timeduper-hidden';
  const INSTANCE_ATTRIBUTE = 'data-timeduper-phase01-active';
  const URL_POLL_INTERVAL_MS = 1500;
  const NAVIGATION_DISCOVERY_WINDOW_MS = 10000;

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

  const BLOCKED_LINK_SELECTOR = [
    'a[href="/reel"]',
    'a[href^="/reel/"]',
    'a[href^="/reel?"]',
    'a[href="/reels"]',
    'a[href^="/reels/"]',
    'a[href^="/reels?"]',
    'a[href="/explore"]',
    'a[href^="/explore/"]',
    'a[href^="/explore?"]',
    'a[href="https://www.instagram.com/reel"]',
    'a[href^="https://www.instagram.com/reel/"]',
    'a[href^="https://www.instagram.com/reel?"]',
    'a[href="https://www.instagram.com/reels"]',
    'a[href^="https://www.instagram.com/reels/"]',
    'a[href^="https://www.instagram.com/reels?"]',
    'a[href="https://www.instagram.com/explore"]',
    'a[href^="https://www.instagram.com/explore/"]',
    'a[href^="https://www.instagram.com/explore?"]',
  ].join(',\n    ');

  const CSS = `
    [${HIDDEN_ATTRIBUTE}] {
      display: none !important;
    }

    ${BLOCKED_LINK_SELECTOR} {
      display: none !important;
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
  const pendingNavigationNodes = new Map();

  function warn(error) {
    // 例外時はInstagramの通常動作を優先し、情報の保存や送信は行わない。
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
    if (!(root instanceof Element) || !root.isConnected || !root.matches(NAVIGATION_ROOT_SELECTOR)) {
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
      return routeKind;
    }

    if (!navigationRoots.has(navigationRoot) || !navigationRoot.contains(control)) {
      return null;
    }

    return classifyFallbackLabel(control);
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

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      stopUrlPolling();
      return;
    }

    installStyle();
    checkForUrlChange();
    scheduleNavigationRefresh();
    startUrlPolling();
  }

  function handlePageShow() {
    installStyle();
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

    const style = document.getElementById(STYLE_ID);
    if (style) {
      style.remove();
    }

    if (instanceClaimed && document.documentElement) {
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

  function start() {
    if (!document.documentElement || !claimInstance()) {
      return;
    }

    try {
      installStyle();
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
