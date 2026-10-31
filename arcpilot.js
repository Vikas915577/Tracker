/* Winter Arc Tracker V26.0 — ArcPilot
 * Local-only habit trend signals and transparent weekly what-if estimates.
 * Reads progress_tracker_v17 without modifying it. Preferences use a separate key.
 */
(function () {
  'use strict';

  const DATA_KEY = 'progress_tracker_v17';
  const PREF_KEY = 'winter_arc_arcpilot_v1';
  let pilotOpen = false;

  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));

  function readTracker() {
    try {
      const value = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
      if (!value || !Array.isArray(value.habits)) return null;
      value.checks = value.checks && typeof value.checks === 'object' ? value.checks : {};
      value.freezes = value.freezes && typeof value.freezes === 'object' ? value.freezes : {};
      return value;
    } catch (_) {
      return null;
    }
  }

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function addDays(key, delta) {
    const parts = String(key).split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2], 12);
    d.setDate(d.getDate() + delta);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function habitStart(habit) {
    const raw = String(habit.created || '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}$/.test(raw)) return raw + '-01';
    return '0001-01-01';
  }

  function windowStats(data, habit, daysAgo, count) {
    const today = todayKey();
    const start = habitStart(habit);
    let eligible = 0;
    let completed = 0;
    let frozen = 0;

    for (let i = 0; i < count; i++) {
      const day = addDays(today, -(daysAgo + i));
      if (day < start) continue;
      const key = String(habit.id) + '|' + day;
      if (data.freezes[key]) {
        frozen++;
        continue;
      }
      eligible++;
      if (data.checks[key]) completed++;
    }

    return {
      eligible: eligible,
      completed: completed,
      frozen: frozen,
      rate: eligible ? completed / eligible : 0
    };
  }

  function habitSignals(data, habit) {
    const recent = windowStats(data, habit, 0, 7);
    const previous = windowStats(data, habit, 7, 7);
    const totalEligible = recent.eligible + previous.eligible;
    const totalDone = recent.completed + previous.completed;
    const decline = previous.rate - recent.rate;
    let label = 'Learning';
    let tone = 'neutral';
    let reason = 'Keep checking in; more history is needed.';

    if (totalEligible >= 10) {
      if ((recent.eligible >= 4 && recent.rate < 0.40) || decline >= 0.30) {
        label = 'Needs support';
        tone = 'risk';
        reason = 'Recent check-ins are low or have dropped sharply.';
      } else if ((recent.eligible >= 4 && recent.rate < 0.70) || decline >= 0.12) {
        label = 'Watch';
        tone = 'watch';
        reason = 'A small routine adjustment may help protect consistency.';
      } else {
        label = 'Steady';
        tone = 'good';
        reason = 'Recent check-ins are holding up.';
      }
    }

    return {
      recent: recent,
      previous: previous,
      eligible: totalEligible,
      completed: totalDone,
      rate: totalEligible ? totalDone / totalEligible : 0,
      decline: decline,
      label: label,
      tone: tone,
      reason: reason
    };
  }

  function binomialChance(n, probability, target) {
    let chance = 0;
    const p = Math.max(0, Math.min(1, probability));
    for (let k = target; k <= n; k++) {
      let combinations = 1;
      for (let j = 1; j <= k; j++) combinations *= (n - j + 1) / j;
      chance += combinations * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }
    return Math.max(0, Math.min(1, chance));
  }

  function readPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      return {
        habitId: String(saved.habitId || ''),
        target: Math.max(1, Math.min(7, Number(saved.target) || 4))
      };
    } catch (_) {
      return { habitId: '', target: 4 };
    }
  }

  function writePrefs(prefs) {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({
        habitId: String(prefs.habitId || ''),
        target: Math.max(1, Math.min(7, Number(prefs.target) || 4))
      }));
    } catch (_) {}
  }

  function renderPage() {
    const data = readTracker();
    if (!data) {
      return '<div class="v26-arcpilot"><button class="btn" data-v26-pilot-back>← Back to More</button>' +
        '<section class="v24-simple-card"><h2>ArcPilot could not read tracker history</h2>' +
        '<p>Your saved habits have not been changed. Reopen the tracker and try again.</p></section></div>';
    }

    const rows = data.habits.map((habit) => ({
      habit: habit,
      stats: habitSignals(data, habit)
    }));
    const prefs = readPrefs();
    const selected = rows.find((row) => String(row.habit.id) === prefs.habitId) || rows[0] || null;
    const target = prefs.target;
    const ready = !!selected && selected.stats.eligible >= 5;
    const expected = ready ? selected.stats.rate * 7 : 0;
    const chance = ready ? binomialChance(7, selected.stats.rate, target) : 0;
    const steady = rows.filter((row) => row.stats.label === 'Steady').length;
    const watch = rows.filter((row) => row.stats.label === 'Watch').length;
    const support = rows.filter((row) => row.stats.label === 'Needs support').length;

    const options = rows.map((row) => {
      const id = esc(row.habit.id);
      const name = esc((row.habit.icon || '✅') + ' ' + row.habit.name);
      return '<option value="' + id + '"' +
        (selected && String(selected.habit.id) === String(row.habit.id) ? ' selected' : '') +
        '>' + name + '</option>';
    }).join('');

    const targetOptions = Array.from({ length: 7 }, (_, index) => index + 1).map((n) =>
      '<option value="' + n + '"' + (n === target ? ' selected' : '') + '>' +
      n + ' days / week</option>'
    ).join('');

    const habitRows = rows.length ? rows.map((row) => {
      const pct = Math.round(row.stats.rate * 100);
      return '<div class="v26-pilot-row"><div class="v26-pilot-row-main"><b>' +
        esc((row.habit.icon || '✅') + ' ' + row.habit.name) +
        '</b><small>' + row.stats.recent.completed + '/' + row.stats.recent.eligible +
        ' eligible days this week · ' + pct + '% across 14 calendar days</small></div>' +
        '<span class="v26-pilot-status ' + row.stats.tone + '">' + row.stats.label + '</span></div>';
    }).join('') : '<div class="v24-empty"><b>No habits yet.</b><span>Add a habit first. ArcPilot will learn from your check-ins.</span></div>';

    let simulator = '<div class="v26-pilot-note">Complete at least 5 eligible check-in days for this habit to unlock an estimate.</div>';
    if (ready) {
      simulator = '<div class="v26-pilot-result"><div><span>Expected check-ins next week</span><b>' +
        expected.toFixed(1) + ' / 7</b></div><div><span>Estimated chance of meeting target</span><b>' +
        Math.round(chance * 100) + '%</b></div></div>' +
        '<p class="v26-pilot-foot">Estimate uses this habit’s last 14 calendar days and assumes the same average rate continues. It is a planning estimate, not a promise.</p>';
    }

    let rescue = '<p class="v26-pilot-foot">Add habits and record a few days to get a personal recovery suggestion.</p>';
    const needs = rows.filter((row) => row.stats.label === 'Needs support' || row.stats.label === 'Watch')
      .sort((a, b) => a.stats.rate - b.stats.rate)[0];
    const best = rows.filter((row) => row.stats.eligible > 0)
      .sort((a, b) => b.stats.rate - a.stats.rate)[0];

    if (needs) {
      const action = needs.habit.smallWin || needs.habit.action ||
        'Choose the smallest useful version of this habit.';
      rescue = '<div class="v26-pilot-rescue"><span class="kicker">' +
        esc(needs.stats.label + ' · ' + needs.habit.name) +
        '</span><b>Make the next step easier, not bigger.</b><p>' + esc(action) +
        '</p><small>Suggestion only. ArcPilot will not edit your habit or schedule automatically.</small></div>';
    } else if (best) {
      rescue = '<div class="v26-pilot-rescue"><span class="kicker">PROTECT WHAT WORKS</span><b>' +
        esc(best.habit.name) + '</b><p>Your strongest recent pattern is worth keeping consistent.</p></div>';
    }

    return '<div class="v24-page v26-arcpilot">' +
      '<section class="v24-detail-head"><button class="btn" data-v26-pilot-back>← More</button>' +
      '<h1>🧭 ArcPilot</h1><span class="kicker">V26 · PERSONAL INTELLIGENCE</span></section>' +
      '<section class="v24-simple-card"><div class="v26-pilot-intro"><b>Learn · Notice · Adjust</b>' +
      '<p>Your own check-ins reveal patterns. ArcPilot compares the latest 7 days with the 7 days before them, then lets you test a realistic weekly target.</p>' +
      '<span>🔒 Local-only analysis · No AI API · No automatic changes</span></div></section>' +
      '<section class="v26-pilot-summary"><div><b>' + rows.length + '</b><span>Habits tracked</span></div>' +
      '<div><b>' + steady + '</b><span>Steady</span></div><div><b>' + watch + '</b><span>Watch</span></div>' +
      '<div><b>' + support + '</b><span>Need support</span></div></section>' +
      '<section class="v24-simple-card"><div class="v24-section-head"><h2>Your patterns</h2>' +
      '<span class="kicker">LAST 14 DAYS</span></div><div class="v26-pilot-list">' + habitRows + '</div>' +
      '<p class="v26-pilot-foot">Frozen days are excluded. New habits show “Learning” until enough history exists.</p></section>' +
      '<section class="v24-simple-card"><div class="v24-section-head"><h2>What-if simulator</h2>' +
      '<span class="kicker">NEXT 7 DAYS</span></div>' +
      (rows.length ? '<div class="v26-pilot-controls"><label>Choose a habit<select id="v26PilotHabit">' +
        options + '</select></label><label>Weekly target<select id="v26PilotTarget">' +
        targetOptions + '</select></label></div>' + simulator : simulator) +
      '</section><section class="v24-simple-card"><div class="v24-section-head"><h2>Rescue suggestion</h2>' +
      '<span class="kicker">NO AUTO-EDIT</span></div>' + rescue + '</section>' +
      '<section class="v26-pilot-note"><b>How to read this:</b> These are descriptive signals from your saved history. ' +
      'They cannot identify why a habit was missed, and small samples can be misleading. You control every change.</section>' +
      '<button class="btn block" data-v26-pilot-back>Back to More</button></div>';
  }

  function openPage() {
    const main = document.querySelector('.v20-main');
    if (!main) return;
    pilotOpen = true;
    try {
      history.pushState({ v26ArcPilot: true }, '', location.pathname + location.search + '#arc-pilot');
    } catch (_) {}
    main.innerHTML = renderPage();
  }

  function returnToMore() {
    if (pilotOpen && location.hash === '#arc-pilot') {
      history.back();
      return;
    }
    pilotOpen = false;
    const more = document.querySelector('[data-v20-nav="more"]');
    if (more) more.click();
  }

  document.addEventListener('click', (event) => {
    const open = event.target.closest('[data-v26-pilot-open]');
    if (open) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openPage();
      return;
    }
    const back = event.target.closest('[data-v26-pilot-back]');
    if (back) {
      event.preventDefault();
      event.stopImmediatePropagation();
      returnToMore();
    }
  }, true);

  document.addEventListener('change', (event) => {
    if (event.target.id !== 'v26PilotHabit' && event.target.id !== 'v26PilotTarget') return;
    const prefs = readPrefs();
    if (event.target.id === 'v26PilotHabit') prefs.habitId = event.target.value;
    if (event.target.id === 'v26PilotTarget') prefs.target = Number(event.target.value) || 4;
    writePrefs(prefs);
    const main = document.querySelector('.v20-main');
    if (main && pilotOpen) main.innerHTML = renderPage();
  }, true);

  window.addEventListener('popstate', () => {
    if (!pilotOpen) return;
    pilotOpen = false;
    const more = document.querySelector('[data-v20-nav="more"]');
    if (more) more.click();
  });

  function injectMoreTile() {
    const main = document.querySelector('.v20-main');
    if (!main) return;
    if (main.querySelector('.v26-arcpilot')) return;
    const kicker = main.querySelector('.v24-page-head .kicker');
    const group = main.querySelector('.v24-page-head + .v24-group');
    if (!kicker || kicker.textContent.trim().toUpperCase() !== 'MORE' || !group) {
      pilotOpen = false;
      return;
    }
    if (main.querySelector('[data-v26-pilot-open]')) return;
    const section = document.createElement('section');
    section.className = 'v24-group';
    section.innerHTML = '<h2>Personal Intelligence</h2>' +
      '<button class="v24-tool-tile v26-pilot-launch" data-v26-pilot-open aria-label="Open ArcPilot">' +
      '<span>🧭</span><div><b>ArcPilot</b><small>Learn your patterns and simulate weekly goals.</small></div><strong>→</strong></button>';
    group.insertAdjacentElement('afterend', section);
  }

  function start() {
    injectMoreTile();
    if (!document.body) return;
    const observer = new MutationObserver(injectMoreTile);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
