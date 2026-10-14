(() => {
  'use strict';

  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  const MAX_ROWS = 250000;
  const SAMPLE = {
    name: 'Example study data',
    headers: ['participant', 'cohort', 'study_hours', 'score', 'completed'],
    rows: [
      ['P-01', 'A', '2.5', '78', 'Yes'], ['P-02', 'A', '3.0', '84', 'Yes'],
      ['P-03', 'B', '1.0', '61', 'No'], ['P-04', 'B', '2.0', '70', 'Yes'],
      ['P-05', 'A', '4.5', '93', 'Yes'], ['P-06', 'C', '1.5', '66', 'No'],
      ['P-07', 'C', '2.0', '72', 'Yes'], ['P-08', 'A', '3.5', '88', 'Yes'],
      ['P-09', 'B', '2.5', '76', 'Yes'], ['P-10', 'C', '', '69', 'No'],
      ['P-11', 'A', '5.0', '97', 'Yes'], ['P-12', 'B', '1.5', '64', 'No'],
      ['P-13', 'C', '3.0', '80', 'Yes'], ['P-14', 'A', '2.0', '75', 'Yes'],
      ['P-15', 'B', '4.0', '', 'Yes'], ['P-16', 'C', '2.5', '74', 'Yes']
    ]
  };

  const el = (id) => document.getElementById(id);
  const state = { data: null, model: [], activeTab: 'overview', selectedVariable: 0 };
  const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function isMissing(value) {
    return value === null || value === undefined || String(value).trim() === '';
  }

  function toNumber(value) {
    const text = String(value).trim();
    if (!text || !numberPattern.test(text)) return null;
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function quantile(sorted, probability) {
    if (!sorted.length) return null;
    if (sorted.length === 1) return sorted[0];
    const position = (sorted.length - 1) * probability;
    const lower = Math.floor(position);
    const fraction = position - lower;
    return sorted[lower] + fraction * (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]);
  }

  function median(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    return quantile(sorted, 0.5);
  }

  function numericStats(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const n = sorted.length;
    if (!n) return null;
    const mean = values.reduce((sum, value) => sum + value, 0) / n;
    const q25 = quantile(sorted, 0.25);
    const med = quantile(sorted, 0.5);
    const q75 = quantile(sorted, 0.75);
    const iqr = q75 - q25;
    const variance = n < 2 ? null : values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / (n - 1);
    const sd = variance === null ? null : Math.sqrt(variance);
    const mad = median(values.map((value) => Math.abs(value - med))) * 1.4826;
    const skewness = n < 3 || !sd ? null : values.reduce((sum, value) => sum + (((value - mean) / sd) ** 3), 0) / n;
    const excess = n < 4 || !sd ? null : values.reduce((sum, value) => sum + (((value - mean) / sd) ** 4), 0) / n - 3;
    const outliers = n < 4 || iqr === 0 ? 0 : values.filter((value) => value < q25 - 1.5 * iqr || value > q75 + 1.5 * iqr).length;
    return {
      n, mean, median: med, variance, sd, minimum: sorted[0], q25, q75,
      maximum: sorted[n - 1], range: sorted[n - 1] - sorted[0], iqr, mad,
      skewness, excessKurtosis: excess, outliers,
      outlierPct: n ? outliers * 100 / n : null
    };
  }

  function modeDetails(values, numeric) {
    if (!values.length) return { value: '', count: 0, ties: false };
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    const highest = [...counts.values()].reduce((max, count) => Math.max(max, count), 0);
    let modes = [...counts.entries()].filter((entry) => entry[1] === highest).map((entry) => entry[0]);
    if (numeric) modes.sort((a, b) => Number(a) - Number(b));
    else modes.sort((a, b) => a.localeCompare(b));
    return { value: modes.join(', '), count: highest, ties: modes.length > 1 };
  }

  function buildModel(data) {
    const model = data.headers.map((name, index) => {
      const raw = data.rows.map((row) => row[index] ?? '');
      const present = raw.filter((value) => !isMissing(value));
      const parsed = present.map(toNumber);
      const numeric = present.length > 0 && parsed.every((value) => value !== null);
      const values = numeric ? parsed : present.map((value) => String(value).trim());
      const stats = numeric ? numericStats(values) : null;
      const mode = modeDetails(numeric ? values.map(String) : values, numeric);
      return {
        name, index, type: numeric ? 'numeric' : 'categorical', raw,
        values, n: raw.length, missing: raw.length - present.length,
        missingPct: raw.length ? 100 * (raw.length - present.length) / raw.length : null,
        unique: new Set(values.map(String)).size, stats, mode
      };
    });
    const totalCells = data.rows.length * data.headers.length;
    const missing = model.reduce((sum, column) => sum + column.missing, 0);
    const rowKeys = new Set();
    let duplicateRows = 0;
    data.rows.forEach((row) => {
      const key = JSON.stringify(row);
      if (rowKeys.has(key)) duplicateRows += 1;
      rowKeys.add(key);
    });
    return {
      columns: model, totalCells, missing,
      completeness: totalCells ? 100 * (totalCells - missing) / totalCells : 100,
      completeRows: data.rows.filter((row) => row.every((value) => !isMissing(value))).length,
      duplicateRows
    };
  }

  function formatNumber(value, digits = 2) {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—';
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value);
  }

  function setStatus(message, success = false) {
    const node = el('status-message');
    node.textContent = message;
    node.classList.toggle('is-success', success);
    node.hidden = !message;
  }

  function setDataset(data) {
    state.data = data;
    state.model = buildModel(data);
    state.selectedVariable = Math.max(0, Math.min(state.selectedVariable, state.model.columns.length - 1));
    el('dataset-name').textContent = data.name;
    el('sample-badge').hidden = !data.isSample;
    el('download-button').disabled = !data.rows.length || !data.headers.length;
    el('metric-rows').textContent = new Intl.NumberFormat().format(data.rows.length);
    el('metric-columns').textContent = new Intl.NumberFormat().format(data.headers.length);
    el('metric-missing').textContent = new Intl.NumberFormat().format(state.model.missing);
    el('metric-missing-foot').textContent = `${formatNumber(state.model.totalCells ? 100 * state.model.missing / state.model.totalCells : 0, 1)}% of all data cells`;
    el('metric-complete').textContent = `${formatNumber(state.model.completeness, 1)}%`;
    el('variable-count').textContent = String(data.headers.length);
    renderAll();
    setStatus(data.isSample ? 'You are viewing an illustrative sample. Upload a CSV to explore your own data.' : `Loaded ${data.rows.length.toLocaleString()} observations from ${data.name}.`, true);
  }

  function renderAll() {
    renderMissingness();
    renderInsights();
    renderPreview();
    renderSummary();
    renderVariablePicker();
    renderExplore();
  }

  function renderMissingness() {
    const host = el('missingness-list');
    host.replaceChildren();
    const columns = state.model.columns.slice().sort((a, b) => b.missingPct - a.missingPct);
    el('missingness-empty').hidden = columns.some((column) => column.missing > 0);
    columns.slice(0, 7).forEach((column) => {
      const row = make('div', 'missing-row');
      const label = make('span', 'missing-name', column.name);
      label.title = column.name;
      const track = make('span', 'bar-track');
      const fill = make('span', `bar-fill${column.missing ? ' has-missing' : ''}`);
      fill.style.width = `${Math.max(column.missing ? 3 : 0, column.missingPct || 0)}%`;
      track.append(fill);
      row.append(label, track, make('span', 'missing-value', `${formatNumber(column.missingPct || 0, 1)}%`));
      host.append(row);
    });
    el('missingness-total').textContent = `${state.model.missing.toLocaleString()} total`;
  }

  function renderInsights() {
    const host = el('insight-list');
    host.replaceChildren();
    const findings = [];
    const missingPct = state.model.totalCells ? 100 * state.model.missing / state.model.totalCells : 0;
    if (missingPct > 10) findings.push(['!', 'Missing values across the dataset', `${formatNumber(missingPct, 1)}% of cells are empty. Check whether the pattern is systematic.`]);
    if (state.model.duplicateRows) findings.push(['!', 'Repeated rows found', `${state.model.duplicateRows.toLocaleString()} duplicate observation${state.model.duplicateRows === 1 ? '' : 's'} detected.`]);
    state.model.columns.forEach((column) => {
      if (column.missingPct > 20) findings.push(['!', `Missingness in ${column.name}`, `${formatNumber(column.missingPct, 1)}% of this variable is empty.`]);
      if (column.stats && column.stats.outlierPct > 5) findings.push(['!', `Review ${column.name} outliers`, `${column.stats.outliers} values fall beyond the 1.5 × IQR fences. These are flags, not errors.`]);
    });
    const display = findings.slice(0, 4);
    if (!display.length) display.push(['✓', 'No major quality flags', 'Missingness, duplicate rows, and IQR outlier thresholds look unremarkable. Keep exploring.']);
    display.forEach(([icon, title, detail]) => {
      const item = make('div', `insight-item${icon === '✓' ? ' is-clear' : ''}`);
      item.append(make('span', 'insight-icon', icon));
      const copy = make('div', 'insight-copy');
      copy.append(make('p', 'insight-title', title), make('p', 'insight-detail', detail));
      item.append(copy);
      host.append(item);
    });
  }

  function renderPreview() {
    const head = el('preview-head');
    const body = el('preview-body');
    head.replaceChildren();
    body.replaceChildren();
    const headerRow = make('tr');
    state.data.headers.forEach((name) => headerRow.append(make('th', '', name)));
    head.append(headerRow);
    state.data.rows.slice(0, 8).forEach((row) => {
      const tr = make('tr');
      state.data.headers.forEach((_, index) => {
        const value = row[index] ?? '';
        const td = make('td', isMissing(value) ? 'missing-cell' : '', isMissing(value) ? 'Missing' : value);
        td.title = isMissing(value) ? 'Empty CSV cell' : value;
        tr.append(td);
      });
      body.append(tr);
    });
    el('preview-count').textContent = `Showing ${Math.min(8, state.data.rows.length)} of ${state.data.rows.length.toLocaleString()} rows`;
    el('preview-caption').textContent = `FIRST ${Math.min(8, state.data.rows.length)} OBSERVATIONS`;
  }

  function renderSummary() {
    const body = el('summary-body');
    body.replaceChildren();
    const query = el('variable-search').value.trim().toLocaleLowerCase();
    const shown = state.model.columns.filter((column) => column.name.toLocaleLowerCase().includes(query));
    el('no-variable-results').hidden = shown.length > 0;
    shown.forEach((column) => {
      const tr = make('tr');
      tr.tabIndex = 0;
      tr.setAttribute('aria-label', `Explore ${column.name}`);
      const type = make('td');
      type.append(make('span', `type-chip${column.type === 'categorical' ? ' is-category' : ''}`, column.type));
      const stats = column.stats;
      const values = [
        column.name, null, column.n, column.missing,
        column.unique, stats?.mean, stats?.median, stats?.sd, stats?.iqr, stats?.outliers
      ];
      values.forEach((value, index) => {
        if (index === 1) tr.append(type);
        else {
          const td = make('td', index >= 2 ? 'number-cell' : '', typeof value === 'number' && index >= 5 && index <= 8 ? formatNumber(value) : (value ?? '—').toLocaleString?.() ?? String(value ?? '—'));
          tr.append(td);
        }
      });
      tr.addEventListener('click', () => selectAndExplore(column.index));
      tr.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectAndExplore(column.index);
        }
      });
      body.append(tr);
    });
  }

  function renderVariablePicker() {
    const select = el('variable-select');
    select.replaceChildren();
    state.model.columns.forEach((column) => {
      const option = make('option', '', column.name);
      option.value = String(column.index);
      select.append(option);
    });
    if (state.model.columns.length) select.value = String(state.selectedVariable);
  }

  function detailStat(label, value) {
    const item = make('div', 'detail-stat');
    item.append(make('span', 'detail-stat-label', label), make('span', 'detail-stat-value', value));
    return item;
  }

  function renderExplore() {
    const column = state.model.columns[state.selectedVariable];
    if (!column) return;
    el('chart-title').textContent = column.type === 'numeric' ? `${column.name} · distribution` : `${column.name} · frequency`;
    el('chart-caption').textContent = column.type === 'numeric' ? 'Histogram of finite, non-missing values.' : `Most frequent values in ${column.name}.`;
    el('detail-title').textContent = column.name;
    el('detail-type').textContent = column.type;
    el('detail-type').classList.toggle('is-category', column.type === 'categorical');
    const numericDetails = el('numeric-details');
    const categoryDetails = el('category-details');
    numericDetails.replaceChildren();
    categoryDetails.replaceChildren();
    if (column.stats) {
      const stats = column.stats;
      [
        ['Valid n', stats.n.toLocaleString()], ['Mean', formatNumber(stats.mean)],
        ['Median', formatNumber(stats.median)], ['Sample SD', formatNumber(stats.sd)],
        ['Q1 · Q3', `${formatNumber(stats.q25)} · ${formatNumber(stats.q75)}`], ['IQR', formatNumber(stats.iqr)],
        ['Scaled MAD', formatNumber(stats.mad)], ['IQR outliers', `${stats.outliers} (${formatNumber(stats.outlierPct, 1)}%)`],
        ['Skewness', formatNumber(stats.skewness)], ['Excess kurtosis', formatNumber(stats.excessKurtosis)]
      ].forEach(([label, value]) => numericDetails.append(detailStat(label, value)));
      numericDetails.hidden = false;
      categoryDetails.hidden = true;
      el('method-note').textContent = 'Quartiles use R type 7; SD uses n − 1. Outliers use 1.5 × IQR fences and are flags for review.';
    } else {
      numericDetails.hidden = true;
      categoryDetails.hidden = false;
      const counts = new Map();
      column.values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5);
      const modeCopy = column.mode.ties ? `Tied modes: ${column.mode.value}` : `Most common: ${column.mode.value || '—'}`;
      categoryDetails.append(make('p', '', `${column.unique.toLocaleString()} unique values · ${modeCopy}`));
      top.forEach(([value, count]) => {
        const row = make('div', 'category-stat');
        row.append(make('b', '', value), make('span', '', `${count.toLocaleString()} · ${formatNumber(100 * count / Math.max(1, column.values.length), 1)}% of valid values`));
        categoryDetails.append(row);
      });
      el('method-note').textContent = 'Empty cells are excluded. Categories are sorted by frequency; tied modes are shown in alphabetical order.';
    }
    el('chart-count').textContent = `${column.values.length.toLocaleString()} valid · ${column.missing.toLocaleString()} missing`;
    drawChart(column);
  }

  function drawChart(column) {
    const canvas = el('distribution-chart');
    const empty = el('chart-empty');
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);
    ctx.font = '10px DM Sans, system-ui, sans-serif';
    ctx.fillStyle = '#849089';
    ctx.strokeStyle = '#e9eeeb';
    ctx.lineWidth = 1;
    const pad = { left: 43, right: 12, top: 15, bottom: 35 };
    const plotW = Math.max(1, width - pad.left - pad.right);
    const plotH = Math.max(1, height - pad.top - pad.bottom);
    const values = column.type === 'numeric' ? column.values : [];
    if (!column.values.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    if (column.type === 'numeric') {
      let min = values[0];
      let max = values[0];
      values.forEach((value) => {
        if (value < min) min = value;
        if (value > max) max = value;
      });
      if (min === max) { min -= 0.5; max += 0.5; }
      const q25 = quantile(values.slice().sort((a, b) => a - b), 0.25);
      const q75 = quantile(values.slice().sort((a, b) => a - b), 0.75);
      const iqr = q75 - q25;
      const fdWidth = iqr > 0 ? 2 * iqr / Math.cbrt(values.length) : 0;
      const bins = Math.max(5, Math.min(18, fdWidth > 0 ? Math.ceil((max - min) / fdWidth) : Math.ceil(Math.sqrt(values.length))));
      const counts = Array(bins).fill(0);
      values.forEach((value) => {
        const index = Math.min(bins - 1, Math.floor((value - min) / (max - min) * bins));
        counts[index] += 1;
      });
      const maxCount = Math.max(...counts, 1);
      drawGrid(ctx, pad, plotW, plotH, maxCount, formatNumber);
      const gap = Math.min(5, plotW / bins * .16);
      const barW = plotW / bins - gap;
      counts.forEach((count, index) => {
        const barH = count / maxCount * plotH;
        ctx.fillStyle = '#4f9875';
        roundedRect(ctx, pad.left + index * (barW + gap), pad.top + plotH - barH, barW, barH, 3);
      });
      ctx.fillStyle = '#849089';
      ctx.textAlign = 'center';
      ctx.fillText(formatNumber(min), pad.left, height - 12);
      ctx.fillText(formatNumber(max), pad.left + plotW, height - 12);
      ctx.fillText(formatNumber((min + max) / 2), pad.left + plotW / 2, height - 12);
    } else {
      const counts = new Map();
      column.values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
      const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
      const maxCount = Math.max(...entries.map((entry) => entry[1]), 1);
      const rowH = Math.min(29, plotH / entries.length);
      const labelW = Math.min(120, Math.max(55, plotW * .32));
      const trackX = pad.left + labelW + 8;
      const trackW = Math.max(20, plotW - labelW - 52);
      ctx.textAlign = 'right';
      entries.forEach(([label, count], index) => {
        const y = pad.top + index * rowH + rowH / 2;
        const shortLabel = truncate(ctx, label, labelW);
        ctx.fillStyle = '#69766f';
        ctx.fillText(shortLabel, pad.left + labelW, y + 3);
        ctx.fillStyle = '#edf2ee';
        roundedRect(ctx, trackX, y - 4, trackW, 8, 4);
        ctx.fillStyle = '#6ba485';
        roundedRect(ctx, trackX, y - 4, trackW * count / maxCount, 8, 4);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#829087';
        ctx.fillText(String(count), trackX + trackW + 9, y + 3);
        ctx.textAlign = 'right';
      });
    }
  }

  function drawGrid(ctx, pad, plotW, plotH, maxCount, formatter) {
    const steps = 4;
    ctx.textAlign = 'right';
    for (let step = 0; step <= steps; step += 1) {
      const fraction = step / steps;
      const y = pad.top + plotH - plotH * fraction;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
      ctx.fillStyle = '#909b95';
      ctx.fillText(formatter(maxCount * fraction, 0), pad.left - 8, y + 3);
    }
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    if (height <= 0 || width <= 0) return;
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function truncate(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let short = text;
    while (short.length > 2 && ctx.measureText(`${short}…`).width > maxWidth) short = short.slice(0, -1);
    return `${short}…`;
  }

  function selectAndExplore(index) {
    state.selectedVariable = index;
    el('variable-select').value = String(index);
    switchTab('explore');
  }

  function switchTab(name) {
    state.activeTab = name;
    document.querySelectorAll('.tab-button').forEach((button) => {
      const active = button.dataset.tab === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      const active = panel.id === `panel-${name}`;
      panel.classList.toggle('is-visible', active);
      panel.hidden = !active;
    });
    if (name === 'explore') renderExplore();
  }

  function parseCsv(text) {
    const source = text.replace(/^\uFEFF/, '');
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (quoted) {
        if (char === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
        else if (char === '"') quoted = false;
        else field += char;
      } else if (char === '"') {
        if (field.length) throw new Error('A quote appears in the middle of a field. Please check the CSV formatting.');
        quoted = true;
      } else if (char === ',') {
        row.push(field); field = '';
      } else if (char === '\n' || char === '\r') {
        row.push(field); field = '';
        if (row.some((value) => value.trim() !== '')) rows.push(row);
        row = [];
        if (char === '\r' && source[index + 1] === '\n') index += 1;
      } else field += char;
    }
    if (quoted) throw new Error('A quoted field was not closed. Please check the CSV formatting.');
    if (field.length || row.length) {
      row.push(field);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
    }
    if (rows.length < 2) throw new Error('This file has no observations yet. Add a header row and at least one observation.');
    if (rows.length - 1 > MAX_ROWS) throw new Error(`This file has more than ${MAX_ROWS.toLocaleString()} rows. Try a smaller CSV or use the DataSum R package for larger datasets.`);
    const width = Math.max(...rows.map((values) => values.length));
    if (width > 500) throw new Error('This CSV has more than 500 columns. Reduce the number of columns and try again.');
    const originalHeaders = rows.shift();
    const headers = [];
    const seen = new Map();
    for (let index = 0; index < width; index += 1) {
      const base = (originalHeaders[index] || '').trim() || `Variable ${index + 1}`;
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      headers.push(count === 1 ? base : `${base} (${count})`);
    }
    const values = rows.map((values) => Array.from({ length: width }, (_, index) => values[index] ?? ''));
    return { headers, rows: values };
  }

  function csvCell(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function downloadSummary() {
    const headers = ['variable', 'type', 'n', 'n_complete', 'n_missing', 'missing_pct', 'n_unique', 'mode', 'mode_count', 'mode_ties', 'mean', 'median', 'sd', 'variance', 'minimum', 'q25', 'q75', 'maximum', 'range', 'iqr', 'mad', 'skewness', 'excess_kurtosis', 'outlier_count', 'outlier_pct'];
    const lines = [headers.map(csvCell).join(',')];
    state.model.columns.forEach((column) => {
      const stats = column.stats;
      const values = [
        column.name, column.type, column.n, column.n - column.missing, column.missing,
        column.missingPct, column.unique, column.mode.value, column.mode.count, column.mode.ties,
        stats?.mean, stats?.median, stats?.sd, stats?.variance, stats?.minimum,
        stats?.q25, stats?.q75, stats?.maximum, stats?.range, stats?.iqr, stats?.mad,
        stats?.skewness, stats?.excessKurtosis, stats?.outliers, stats?.outlierPct
      ];
      lines.push(values.map(csvCell).join(','));
    });
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = make('a');
    link.href = url;
    link.download = `${safeFilename(state.data.name)}-datasum-summary.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function safeFilename(value) {
    return String(value).replace(/\.csv$/i, '').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'dataset';
  }

  async function readFile(file) {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setStatus('Please choose a .csv file. Excel workbooks should first be exported as CSV.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStatus('This CSV is larger than 25 MB. Try a smaller file or use the DataSum R package for large datasets.');
      return;
    }
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.headers.length) throw new Error('No column headers were found in the first row.');
      setDataset({ ...parsed, name: file.name, isSample: false });
      el('file-input').value = '';
    } catch (error) {
      setStatus(error.message || 'The CSV could not be read. Check its formatting and try again.');
    }
  }

  function attachEvents() {
    el('browse-button').addEventListener('click', () => el('file-input').click());
    el('file-input').addEventListener('change', (event) => readFile(event.target.files[0]));
    el('sample-button').addEventListener('click', () => setDataset({ ...SAMPLE, isSample: true }));
    el('download-button').addEventListener('click', downloadSummary);
    el('variable-search').addEventListener('input', renderSummary);
    el('variable-select').addEventListener('change', (event) => {
      state.selectedVariable = Number(event.target.value);
      renderExplore();
    });
    document.querySelectorAll('.tab-button').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    document.querySelectorAll('[data-open-tab]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.openTab)));
    const drop = el('drop-zone');
    ['dragenter', 'dragover'].forEach((eventName) => drop.addEventListener(eventName, (event) => {
      event.preventDefault();
      drop.classList.add('is-dragging');
    }));
    ['dragleave', 'drop'].forEach((eventName) => drop.addEventListener(eventName, (event) => {
      event.preventDefault();
      drop.classList.remove('is-dragging');
    }));
    drop.addEventListener('drop', (event) => readFile(event.dataTransfer.files[0]));
    window.addEventListener('resize', () => {
      if (state.activeTab === 'explore') renderExplore();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setStatus('');
    });
  }

  attachEvents();
  el('footer-year').textContent = new Date().getFullYear();
  setDataset({ ...SAMPLE, isSample: true });
})();

