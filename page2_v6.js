// =========================================
// crm amtel automator
// =========================================

let gloable_icc_id = null;
let gloable_msisdn = null;
let iccidPromptProvided = false;
let iccidUiConfirmed = false;

let iccidLog = JSON.parse(localStorage.getItem('iccidLog') || '[]');

// --- Utility: Save logs safely ---
function saveLog() {
  try {
    localStorage.setItem('iccidLog', JSON.stringify(iccidLog));
  } catch (e) {
    console.error("❌ localStorage save failed:", e);
    alert("⚠️ Warning: Log not saved (storage full?)");
  }
}

// --- Check for duplicate ICCID ---
function isDuplicate(iccid) {
  return iccidLog.some(entry => entry.iccid === iccid);
}


// Check if MSISDN was used in the last 2 days
function isMsisdnUsedRecently(msisdn, maxDays = 7) {
  const now = Date.now();
  const cutoff = now - (maxDays * 24 * 60 * 60 * 1000); // 2 days in ms

  return iccidLog.some(entry => {
    if (entry.msisdn !== msisdn) return false;
    
    const entryTime = new Date(entry.timestamp).getTime();
    return entryTime >= cutoff; // only recent entries
  });
}

// --- Main logging function ---
function saveIccid(iccid, options = {}) {
  if (!iccid || typeof iccid !== 'string') {
    console.warn("⚠️ Invalid ICCID:", iccid);
    return false;
  }

  if (isDuplicate(iccid)) {
    console.log(`🔁 Duplicate ICCID ${iccid} — skipped.`);
    alert(`ICCID ${iccid} already logged!`);
    return false;
  }

  const logEntry = {
    id: Date.now(),
    iccid: iccid.length > 7 ? iccid.slice(-7) : iccid.trim(), // Store only last 7 digits
    msisdn: (options.msisdn || '').trim(),
    timestamp: new Date().toISOString(),
    timeDisplay: new Date().toLocaleString('en-US', { timeZone: 'Africa/Mogadishu' }),
    status: options.status || 'logged',
    notes: options.notes || ''
  };

  iccidLog.push(logEntry);
  saveLog();
  console.log(`📝 Logged: ${iccid} → MSISDN: ${logEntry.msisdn}`);
  return true;
}

// --- Delete log by ID ---
function deleteLog(id) {
  const before = iccidLog.length;
  iccidLog = iccidLog.filter(e => e.id !== id);
  if (iccidLog.length < before) {
    saveLog();
    console.log(`🗑️ Deleted log ID: ${id}`);
    return true;
  }
  console.warn(`⚠️ Log ID ${id} not found.`);
  return false;
}

// --- Clear all logs ---
function clearAllLogs() {
  if (confirm("Clear all ICCID logs? This cannot be undone.")) {
    iccidLog = [];
    saveLog();
    console.log("🧹 All logs cleared.");
  }
}


// --- Detect ICCID in UI ---
function detectIccidInUi(expectedIccid) {
  if (!expectedIccid) return false;

  const selectors = [
    'input[value*="' + expectedIccid.slice(-6) + '"]',
    '[data-iccid]',
    '.iccid-display',
    '#iccidSummary',
    'table tbody tr td',
    '.selected-item span',
    '.form-summary .row'
  ];

  for (const sel of selectors) {
    const elements = document.querySelectorAll(sel);
    for (const el of elements) {
      const text = (el.value || el.textContent || el.innerText || '').replace(/\D/g, '');
      if (text.includes(expectedIccid) || text.endsWith(expectedIccid.slice(-8))) {
        return true;
      }
    }
  }

  const bodyText = document.body.innerText.replace(/\D/g, '');
  return bodyText.includes(expectedIccid) || bodyText.endsWith(expectedIccid.slice(-8));
}

// --- Get valid 7-digit ICCID suffix with retry ---
async function getValidIccidSuffix(initialMessage = "Enter ICCID suffix (7 digits):") {
  const MAX_ATTEMPTS = 3;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    const suffix = prompt(
      `${initialMessage}\nAttempt ${attempt + 1}/${MAX_ATTEMPTS}:`
    );

    if (suffix === null) {
      return null; // User clicked Cancel
    }

    const clean = suffix.replace(/\D/g, ''); // Remove all non-digits
    if (clean.length === 7) {
      return clean;
    }

    attempt++;
    if (attempt >= MAX_ATTEMPTS) {
      alert(`❌ Max attempts (${MAX_ATTEMPTS}) reached.\nExpected 7 digits, got "${clean}" (${clean.length} digits).`);
      return null;
    }

    alert(
      `⚠️ Invalid input!\nYou entered: "${suffix}"\nCleaned to: "${clean}" (${clean.length} digits)\nPlease enter exactly 7 digits.`
    );
  }
  return null;
}

// --- GENERATE REPORT ---
// --- GENERATE DAILY ACTIVATION REPORT ---
// --- ENHANCED ACTIVATION REPORT ---
// --- UNIFIED ACTIVATION REPORT (with all formats) ---
function generateActivationReport(format = 'detailed') {
  if (!iccidLog.length) {
    alert("No logs to export.");
    return;
  }

  let content = '';
  let filename = '';
  let type = 'text/plain';

  if (format === 'simple') {
    // Simple daily counts
    const dailyCounts = {};
    for (const entry of iccidLog) {
      const d = new Date(entry.timestamp);
      const dateKey = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    }
    
    const sortedDates = Object.keys(dailyCounts).sort((a, b) => {
      const [aD, aM, aY] = a.split('/');
      const [bD, bM, bY] = b.split('/');
      return new Date(bY, bM-1, bD) - new Date(aY, aM-1, aD);
    });
    
    const lines = [
      `ICCID SIMPLE REPORT`,
      `Total: ${iccidLog.length}`,
      ``,
      `Daily Counts:`
    ];
    sortedDates.forEach(date => {
      lines.push(`${date}: ${dailyCounts[date]}`);
    });
    content = lines.join('\n');
    filename = `ICCID-Simple-${new Date().toISOString().split('T')[0]}.txt`;

  } else if (format === 'csv') {
    // ✅ MATCH download_log() EXACTLY

    function formatDateDisplay(dateStr) {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}:${seconds}`
      };
    }

    const headers = ['Date', 'Time', 'ICCID', 'MSISDN', 'Notes'];
    const rows = iccidLog.map(e => {
      const { date, time } = formatDateDisplay(e.timestamp);
      // ✅ EXACT same format as download_log(): no quotes, no escaping
      return [
        date,
        time,
        e.iccid,        // 7-digit suffix only
        e.msisdn,       // clean (no 252)
        ''              // empty Notes
      ].join(',');
    });

    content = [headers.join(','), ...rows].join('\n');
    filename = `ICCID-Export-${new Date().toISOString().split('T')[0]}.csv`;
    type = 'text/csv';

  } else {
    // ✅ CLEAN DETAILED REPORT WITH MONTH DIVIDERS (no warnings, no copy blocks)
    const dailyData = {};
    for (const entry of iccidLog) {
      const d = new Date(entry.timestamp);
      const dateKey = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      if (!dailyData[dateKey]) dailyData[dateKey] = [];
      dailyData[dateKey].push({ iccid: entry.iccid, msisdn: entry.msisdn });
    }

    const sortedDates = Object.keys(dailyData).sort((a, b) => {
      const [aDay, aMonth, aYear] = a.split('/');
      const [bDay, bMonth, bYear] = b.split('/');
      return new Date(bYear, bMonth - 1, bDay) - new Date(aYear, aMonth - 1, aDay);
    });

    const lines = [
      `ICCID ACTIVATION REPORT`,
      `=====================`,
      `Total Activations: ${iccidLog.length}`,
      ``,
      `DAILY BREAKDOWN:`
    ];

    let lastMonth = null;
    for (const date of sortedDates) {
      const [day, month, year] = date.split('/');
      const monthKey = `${year}-${month}`;

      // ✅ Add divider when month changes
      if (lastMonth !== null && lastMonth !== monthKey) {
        lines.push(`\n───────────────`, ``);
      }
      lastMonth = monthKey;

      const entries = dailyData[date];
      lines.push(`${date} (${entries.length} activation(s)}):`);
      entries.forEach(e => {
        lines.push(`  • ICCID: ${e.iccid} | MSISDN: ${e.msisdn}`);
      });
      lines.push(``); // blank line after each day
    }

    content = lines.join('\n');
    filename = `ICCID-Report-Complete-${new Date().toISOString().split('T')[0]}.txt`;
  }

  // Export
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Keep the old name as alias for backward compatibility
window.generateActivationReport = generateActivationReport;

// --- RETRY FUNCTION ---
// --- RETRY FUNCTION (FIXED: preserves state on cancel) ---
async function retryIccidSelection() {
  console.log("🔁 Retrying ICCID selection...");

  // ✅ SAVE CURRENT STATE in case user cancels
  const original_iccid = gloable_icc_id;
  const original_prompt = iccidPromptProvided;
  const original_confirmed = iccidUiConfirmed;

  // Reset for retry attempt
  iccidPromptProvided = false;
  iccidUiConfirmed = false;
  gloable_icc_id = null;

  const wait = (ms) => new Promise(res => setTimeout(res, ms));
  const addIcons = [...document.querySelectorAll("button.btn.btn-info .material-icons")].filter(s => s.textContent.trim() === "add");
  const addBtn = addIcons[2]?.closest("button");
  if (!addBtn) {
    alert("❌ ICCID Add button not found. Is Page 2 loaded?");
    
    // ❌ Restore state if we can't even start retry
    gloable_icc_id = original_iccid;
    iccidPromptProvided = original_prompt;
    iccidUiConfirmed = original_confirmed;
    return false;
  }

  addBtn.click();

  let modal = null;
  for (let i = 0; i < 25; i++) {
    modal = [...document.querySelectorAll(".modal-content")].find(m => m.textContent.includes("IMSI List"));
    if (modal) break;
    await wait(120);
  }
  if (!modal) {
    alert("❌ ICCID modal failed to open.");
    
    // ❌ Restore state
    gloable_icc_id = original_iccid;
    iccidPromptProvided = original_prompt;
    iccidUiConfirmed = original_confirmed;
    return false;
  }

  // Get valid 7-digit suffix with retry
  const cleanSuffix = await getValidIccidSuffix("Re-enter ICCID suffix (7 digits):");
  
  // ✅ USER CANCELED OR FAILED INPUT → RESTORE ORIGINAL STATE
  if (!cleanSuffix) {
    gloable_icc_id = original_iccid;
    iccidPromptProvided = original_prompt;
    iccidUiConfirmed = original_confirmed;
    console.log("↩️ Retry canceled or invalid — restored previous ICCID state.");
    return false;
  }

  const ICCID_number = `8925263790000${cleanSuffix}`;

  const searchInput = modal.querySelector("input#searchtextIMSI.form-control");
  const searchButton = modal.querySelector(".input-group-append button.btn.btn-info");
  if (!searchInput || !searchButton) {
    alert("Search field not found.");
    
    // ❌ Restore state
    gloable_icc_id = original_iccid;
    iccidPromptProvided = original_prompt;
    iccidUiConfirmed = original_confirmed;
    return false;
  }

  searchInput.value = ICCID_number;
  ["input", "change", "keyup"].forEach(e => searchInput.dispatchEvent(new Event(e, { bubbles: true })));
  searchButton.click();
  await wait(1200);

  const closeBtn = modal.querySelector(".close") || modal.querySelector("button.btn-secondary");
  if (closeBtn) closeBtn.click();
  await wait(800);

  if (detectIccidInUi(ICCID_number)) {
    gloable_icc_id = ICCID_number;
    iccidPromptProvided = true;
    iccidUiConfirmed = true;
    saveIccid(ICCID_number, { msisdn: gloable_msisdn });
    alert("✅ ICCID re-selection successful!");
    return true;
  } else {
    // ❌ ICCID not detected → restore original state
    gloable_icc_id = original_iccid;
    iccidPromptProvided = original_prompt;
    iccidUiConfirmed = original_confirmed;
    alert("⚠️ ICCID not detected after retry. Restored previous entry.");
    return false;
  }
}

// --- Expose functions ---
window.saveIccid = saveIccid;
window.deleteLog = deleteLog;
window.clearAllLogs = clearAllLogs;
window.generateActivationReport = generateActivationReport;
window.retryIccidSelection = retryIccidSelection;
window.iccidLog = iccidLog;

// =========================================
// PAGE1
// =========================================
function page1() {
  function fillFormFromConsole() {
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const generateRandomId = (length) =>
      Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, "0");

    const dispatchEvent = (element, type = "input") => {
      element.dispatchEvent(new Event(type, { bubbles: true }));
    };

    const dispatchAllChangeEvents = (element) => {
      ["change", "input", "blur"].forEach((eventType) => {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
    };

    const setInputValueById = (id, value, eventType = "input") => {
      const el = document.getElementById(id);
      if (!el) {
        console.warn(`Element with id "${id}" not found.`);
        return;
      }
      el.value = value;
      dispatchEvent(el, eventType);
    };

    const clickButtonByText = (text, selector = ".btn-info") => {
      const button = [...document.querySelectorAll(selector)].find(
        (btn) => btn.textContent.trim() === text
      );
      if (!button) {
        console.warn(`Button with text "${text}" not found.`);
        return null;
      }
      button.click();
      return button;
    };

    const today = new Date();
    const expiryDateObj = new Date(today);
    expiryDateObj.setFullYear(today.getFullYear() + 5);

    const randomID = generateRandomId(10);
    const issueDate = formatDate(today);
    const expiryDate = formatDate(expiryDateObj);
    const phoneNumber = "252716408296";

    const TARGET_DOMAIN = "HZvOmetzvIQeEKFSEkdz"; // Somalia
    const TARGET_ZONE = "01DJSVS67JT0PDVE8KR0615C4E"; // ZONE 2
    const TARGET_AREA = "01DK17S11C4RFZTE6RTVRAGJJW"; // Qardho_KARKAAR

    const MAX_POLL_ATTEMPTS = 50;
    const POLL_INTERVAL_MS = 100;

    console.log("-> Starting form fill and validation...");

    const fillBasicInfo = () => {
      setInputValueById("firstName", "Amtel");
      setInputValueById("middleName", "Amtel");
      setInputValueById("lastName", "Amtel");
      setInputValueById("address", "Qardho");
      setInputValueById("gender", "1", "change");
      console.log("Step 1: Basic info filled ✅");
    };

    const openIdentitySection = () => {
      const btn = clickButtonByText("Add New Identity");
      if (!btn) {
        console.error("❌ ERROR: 'Add New Identity' button not found.");
        return false;
      }
      console.log("Step 2: 'Add New Identity' clicked.");
      return true;
    };

    const fillIdentitySection = () => {
      setInputValueById("idnumber", randomID);
      setInputValueById("issuer", "Ministry of Commerce & Industry", "change");
      setInputValueById("issuedate", issueDate);
      setInputValueById("expirydate", expiryDate);

      const saveButton = document.querySelector('.btn-info[type="submit"]');
      if (saveButton) {
        saveButton.click();
        console.log("Step 2: Identity 'Save' clicked.");
      } else {
        console.warn("Identity 'Save' button not found.");
      }
    };

    const fillNextOfKinSection = () => {
      setInputValueById("nextkinfname", "Amtel");
      setInputValueById("nextkinsname", "Amtel");
      setInputValueById("nextkintname", "Amtel");
      setInputValueById("nextkinmsisdn", phoneNumber);
      setInputValueById("alternativeMsisdn", phoneNumber);
      console.log("Step 3: Next of kin filled ✅");
    };

    const setupLocationSelectors = () => {
      const domainSelect = document.getElementById("mdomain");
      const zoneSelect = document.getElementById("mzone");
      const areaSelect = document.getElementById("marea");

      if (!domainSelect || !zoneSelect || !areaSelect) {
        console.error(
          "❌ ERROR: One or more dropdowns (mdomain, mzone, marea) were not found."
        );
        return null;
      }

      return { domainSelect, zoneSelect, areaSelect };
    };

    const pollForOption = (selectEl, value, labelForLogs, onSuccess) => {
      let attempts = 0;

      const attemptPoll = () => {
        attempts += 1;
        const option = selectEl.querySelector(`option[value="${value}"]`);

        if (option) {
          selectEl.value = value;
          dispatchAllChangeEvents(selectEl);
          console.log(
            `${labelForLogs} found and selected. Attempts: ${attempts}`
          );
          onSuccess();
          return;
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          console.error(
            `❌ Timeout: ${labelForLogs} with value "${value}" did not appear in time.`
          );
          return;
        }

        setTimeout(attemptPoll, POLL_INTERVAL_MS);
      };

      attemptPoll();
    };

    const selectLocationWithPolling = () => {
      console.log("Step 4: Starting dependent dropdown selection...");

      const selects = setupLocationSelectors();
      if (!selects) return;

      const { domainSelect, zoneSelect, areaSelect } = selects;

      domainSelect.value = TARGET_DOMAIN;
      dispatchAllChangeEvents(domainSelect);
      console.log("4.1 Domain selected.");

      pollForOption(zoneSelect, TARGET_ZONE, "4.2 Zone", () => {
        console.log("Zone selection complete. Polling for area...");
        pollForOption(areaSelect, TARGET_AREA, "4.3 Area", () => {
          console.log("All dropdown selections complete 🎉");
          onLocationSelectionComplete(areaSelect);
        });
      });
    };

    const onLocationSelectionComplete = (areaSelect) => {
      if (areaSelect.value !== TARGET_AREA) {
        console.warn(
          "Location selection callback fired, but area value is not the expected one."
        );
        return;
      }

      const nextButton = clickButtonByText("Next");
      if (nextButton) {
        console.log("Page 1 done.");
      } else {
        console.warn("Could not find 'Next' button after location selection.");
      }
    };

    fillBasicInfo();
    if (!openIdentitySection()) return;
    fillIdentitySection();
    fillNextOfKinSection();
    selectLocationWithPolling();
  }

  iccidPromptProvided = false;
  iccidUiConfirmed = false;
  gloable_icc_id = null;

  fillFormFromConsole();
}

// =========================================
// PAGE2
// =========================================
async function page2() {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function checkPrepaidCheckbox() {
    const checkbox = document.getElementById("isprepaid");
    if (!checkbox) {
      console.warn('Checkbox with id "isprepaid" not found.');
      return;
    }
    checkbox.checked = true;
    ["click", "input", "change"].forEach((type) =>
      checkbox.dispatchEvent(new Event(type, { bubbles: true }))
    );
    console.log("Prepaid checkbox checked ✅");
  }

  checkPrepaidCheckbox();
  await wait(1000);

  function selectIccidRadio() {
    const radio = document.getElementById("iccid");
    if (!radio) {
      console.warn("ICCID radio not found.");
      return false;
    }
    radio.checked = true;
    ["click", "input", "change"].forEach((evt) =>
      radio.dispatchEvent(new Event(evt, { bubbles: true }))
    );
    console.log("ICCID radio selected.");
    return true;
  }

  if (!selectIccidRadio()) {
    console.error("ICCID radio step failed. Stopping Page2.");
    return;
  }

  async function clickAddAttachPlan() {
    const addIcon = [
      ...document.querySelectorAll("button.btn-info .material-icons"),
    ].find((span) => span.textContent.trim() === "add");

    if (!addIcon) {
      console.warn("Attach Plan +Add button not found.");
      return false;
    }

    const addBtn = addIcon.closest("button");
    addBtn.click();
    await wait(1000);

    let modal = null;
    for (let i = 0; i < 20; i++) {
      modal = document.querySelector(".modal-content");
      if (modal) break;
      await wait(50);
    }
    if (!modal) {
      console.warn("Product Catalog modal did not load.");
      return false;
    }

    await wait(1000);
    let basePlan = null;
    for (let i = 0; i < 15; i++) {
      basePlan = [...modal.querySelectorAll(".card-container")].find(
        (c) =>
          c.querySelector(".heading.bold.red")?.textContent.trim() ===
          "Base plan"
      );
      if (basePlan) break;
      await wait(50);
    }
    if (!basePlan) {
      console.warn("Base plan not found in modal.");
      return false;
    }

    await wait(1000);
    basePlan.click();

    let saveBtn = null;
    for (let i = 0; i < 15; i++) {
      saveBtn = modal.querySelector("button.btn.btn-info.mx-2");
      if (saveBtn) break;
      await wait(50);
    }

    if (!saveBtn) return false;

    await wait(100);
    saveBtn.click();

    for (let i = 0; i < 20; i++) {
      if (!document.querySelector(".modal-content")) break;
      await wait(50);
    }

    console.log("Plan Attached");
    return true;
  }

  const attachDone = await clickAddAttachPlan();
  if (!attachDone) {
    console.error("Attach plan failed. Stopping Page2.");
    return;
  }
  await wait(500);

async function addMsisdnSeries() {
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const addIcons = [
    ...document.querySelectorAll("button.btn-info .material-icons"),
  ].filter((s) => s.textContent.trim() === "add");

  const addBtn = addIcons[1]?.closest("button");
  if (!addBtn) {
    console.warn("MSISDN Add button not found.");
    return false;
  }

  addBtn.click();

  let modal = null;
  for (let i = 0; i < 25; i++) {
    modal = [...document.querySelectorAll(".modal-content")].find((m) =>
      m.textContent.includes("MSISDN List")
    );
    if (modal) break;
    await wait(120);
  }
  if (!modal) {
    console.warn("MSISDN modal not found.");
    return false;
  }

  const checkboxes = [
    ...modal.querySelectorAll('table input.form-check-input[type="checkbox"]'),
  ];

  if (checkboxes.length < 10) {
    alert(`Only ${checkboxes.length} MSISDN rows — cannot select 10th.`);
    return false;
  }

  // ✅ Try rows: 10th (index 9), 9th (8), 8th (7), 7th (6), 6th (5)
  const tryIndices = [9, 8, 7, 6, 5];
  let selectedIdx = -1;
  let capturedMsisdn = null;

  for (const idx of tryIndices) {
    const tenthCheckbox = checkboxes[idx];
    const msisdnRow = tenthCheckbox.closest('tr');
    if (!msisdnRow) continue;

    const msisdnCell =
      msisdnRow.cells[1] ||
      msisdnRow.querySelector('td:nth-child(2)') ||
      msisdnRow.querySelector('td');

    if (!msisdnCell) continue;

    let rawMsisdn = msisdnCell.textContent.trim().replace(/\D/g, '');
    // Remove 252 prefix if present
    if (rawMsisdn.startsWith('252')) {
      rawMsisdn = rawMsisdn.substring(3);
    }

    // Skip if empty or too short
    if (rawMsisdn.length < 9) continue;

    // ✅ Check if already in your log
      const isUsed = isMsisdnUsedRecently(rawMsisdn, 2); // last 2 days
      if (!isUsed) {
      selectedIdx = idx;
      capturedMsisdn = rawMsisdn;
      break; // Use this one!
    }
  }

  // ✅ If all are used, fall back to 10th anyway (to avoid stopping)
  if (selectedIdx === -1) {
    console.warn("⚠️ All of 6th–10th MSISDNs appear used. Using 10th as fallback.");
    selectedIdx = 9;
    const fallbackRow = checkboxes[9].closest('tr');
    const fallbackCell = fallbackRow?.cells[1] || fallbackRow?.querySelector('td:nth-child(2)') || fallbackRow?.querySelector('td');
    if (fallbackCell) {
      let raw = fallbackCell.textContent.trim().replace(/\D/g, '');
      capturedMsisdn = raw.startsWith('252') ? raw.substring(3) : raw;
    }
  }

  if (selectedIdx === -1 || !capturedMsisdn) {
    alert("❌ Failed to extract MSISDN from selected row.");
    return false;
  }

  // ✅ SELECT THE CHECKBOX
  const targetCheckbox = checkboxes[selectedIdx];
  targetCheckbox.checked = true;
  ["click", "input", "change"].forEach((t) =>
    targetCheckbox.dispatchEvent(new Event(t, { bubbles: true }))
  );

  gloable_msisdn = capturedMsisdn;
  console.log(`📱 Selected MSISDN from row ${selectedIdx + 1}:`, gloable_msisdn);

  const saveBtn = modal.querySelector("button.btn.btn-info.mx-2");
  if (saveBtn) {
    await wait(300);
    saveBtn.click();
  }

  // Wait for modal to close
  for (let i = 0; i < 25; i++) {
    const stillOpen = [...document.querySelectorAll(".modal-content")].some(
      (m) => m.textContent.includes("MSISDN List")
    );
    if (!stillOpen) break;
    await wait(120);
  }

  return true;
}

  const msisdnDone = await addMsisdnSeries();
  if (!msisdnDone) {
    console.error("MSISDN failed. Stopping Page2.");
    return;
  }
  await wait(1000);

  // =========================================
  // HANDLE ICCID — WITH 7-DIGIT VALIDATION
  // =========================================
  async function handle_ICCID() {
    const addIcons = [
      ...document.querySelectorAll("button.btn.btn-info .material-icons"),
    ].filter((s) => s.textContent.trim() === "add");
    const addBtn = addIcons[2]?.closest("button");
    if (!addBtn) {
      console.warn("ICCID Add button not found.");
      return false;
    }

    addBtn.click();

    let modal = null;
    for (let i = 0; i < 25; i++) {
      modal = [...document.querySelectorAll(".modal-content")].find((m) =>
        m.textContent.includes("IMSI List")
      );
      if (modal) break;
      await wait(120);
    }
    if (!modal) {
      console.warn("ICCID modal not found.");
      return false;
    }

    // Get valid 7-digit suffix with retry
    const cleanSuffix = await getValidIccidSuffix("Enter ICCID suffix (7 digits) 8925263790000xxxxxx");
    if (!cleanSuffix) {
      return false;
    }
    const ICCID_number = `8925263790000${cleanSuffix}`;
    console.log("✅ Valid ICCID entered:", ICCID_number);

    const searchInput = modal.querySelector("input#searchtextIMSI.form-control");
    const searchButton = modal.querySelector(".input-group-append button.btn.btn-info");
    if (!searchInput || !searchButton) {
      console.warn("ICCID search field/button not found.");
      return false;
    }

    searchInput.value = ICCID_number;
    ["input", "change", "keyup"].forEach((e) =>
      searchInput.dispatchEvent(new Event(e, { bubbles: true }))
    );
    searchButton.click();

    await wait(1200);

    const closeBtn = modal.querySelector(".close") || modal.querySelector("button.btn-secondary");
    if (closeBtn) closeBtn.click();
    await wait(800);

    if (detectIccidInUi(ICCID_number)) {
      gloable_icc_id = ICCID_number;
      iccidPromptProvided = true;
      iccidUiConfirmed = true;
      saveIccid(ICCID_number, { msisdn: gloable_msisdn });
      console.log("✅ ICCID confirmed in UI.");
    } else {
      gloable_icc_id = null;
      iccidPromptProvided = false;
      iccidUiConfirmed = false;
      alert("⚠️ ICCID not detected in UI after selection.");
      return false;
    }

    return true;
  }

  const iccidDone = await handle_ICCID();
  if (!iccidDone) {
    console.error("ICCID step failed. Stopping Page2.");
    return;
  }
  await wait(1000);
}

// =========================================
// NEXT
// =========================================
async function next() {
  if (!iccidPromptProvided || !iccidUiConfirmed || !gloable_icc_id) {
    alert("❌ ICCID not fully confirmed! Please complete Page 2 properly.");
    console.error("next() blocked: ICCID missing or not accepted by UI.");
    return;
  }

  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  async function clickButton(label, timeout = 6000) {
    const start = performance.now();
    let btn = null;
    while (performance.now() - start < timeout) {
      btn = [...document.querySelectorAll("button")]
        .find(b => b.textContent.trim().toLowerCase() === label.toLowerCase());
      if (btn) break;
      await wait(150);
    }
    if (!btn) {
      console.warn(`Button "${label}" not found.`);
      return false;
    }
    btn.click();
    console.log(`Clicked: ${label}`);
    await wait(700);
    return true;
  }

  await clickButton("Next");
  await clickButton("Next");
  await wait(1000);
  
  await clickButton("Checkout");
  
  
async function closeModal(timeout = 8000) {
  const start = performance.now();
  let closeBtn = null;
  while (performance.now() - start < timeout) {
    closeBtn = [...document.querySelectorAll("button.btn.btn-small.btn-info")]
      .find(b => b.textContent.trim().toLowerCase() === "close");
    if (closeBtn) break;
    await wait(200);
  }
  if (closeBtn) {
    closeBtn.click();
    console.log("Modal closed.");
    await wait(500);
    }
  }
  
// Wait for checkout modal body WITH content
let checkoutModalBody = null;
for (let i = 0; i < 50; i++) { // Max 5s
  checkoutModalBody = document.querySelector('.modal.show .modal-body'); // Target VISIBLE modal
  if (checkoutModalBody?.textContent.trim()) break;
  await wait(100);
}

if (checkoutModalBody) {
  // Fallback chain: span > direct p > any text
  const msg = 
    checkoutModalBody.querySelector('span')?.textContent.trim() ||
    checkoutModalBody.querySelector(':scope > p')?.textContent.trim() ||
    checkoutModalBody.textContent.trim();
    console.log("✅ Checkout Message:", msg);
    await wait(1500);
    await closeModal();
} else {
  console.warn("⚠️ Checkout modal not detected");
}

await wait(3000);
  

console.log("🚀 Starting activation flow...");
const activationResult = await completeActivationFlow();

if (activationResult?.success) {
  console.log("✅ FULL PROCESS COMPLETED SUCCESSFULLY");
  console.log("ICCID:", activationResult.iccid);
  console.log("MSISDN:", activationResult.msisdn);
  console.log("Message:", activationResult.message);
} else {
  console.warn("⚠️ Activation flow encountered issues");
}
// =========================================
// COMPLETE ACTIVATION FLOW
// =========================================
async function completeActivationFlow() {
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  // --- 1. COPY ICCID ---
  function copyToClipboard(value) {
    const text = String(value);
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "-999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      console.log("✅ COPIED:", text);
      return true;
    } catch (err) {
      console.error("❌ Copy failed:", err);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  console.log("📋 Copying ICCID:", gloable_icc_id);
  copyToClipboard(gloable_icc_id);

  await wait(500);

  // --- 2. NAVIGATE HOME ---
  function clickHomeLogo() {
    const logo = document.querySelector("img.logoImg");
    if (!logo) {
      console.warn("⚠️ Home logo not found.");
      return false;
    }
    logo.click();
    console.log("🏠 Home logo clicked.");
    return true;
  }

  if (!clickHomeLogo()) return false;
  await wait(1000);

  // --- 3. SELECT ICCID IN DROPDOWN ---
  function selectICCID() {
    const select = document.querySelector("select#idtype");
    if (!select) {
      console.warn("⚠️ Dropdown not found.");
      return false;
    }
    const option = [...select.options].find(
      opt => opt.textContent.trim().toLowerCase() === "iccid"
    );
    if (!option) {
      console.warn("⚠️ ICCID option not found.");
      return false;
    }
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    console.log("🔽 Dropdown changed to ICCID.");
    return true;
  }

  if (!selectICCID()) return false;
  await wait(300);

  // --- 4. FILL SEARCH BAR ---
  function fillSearchBar() {
    const input = document.querySelector("input#number");
    if (!input) {
      console.warn("⚠️ Search bar not found.");
      return false;
    }
    input.value = gloable_icc_id;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("🔍 Search bar filled:", gloable_icc_id);
    return true;
  }

  if (!fillSearchBar()) return false;
  await wait(300);

  // --- 5. CLICK SEARCH ---
  function clickSearchButton() {
    const searchBtn = [...document.querySelectorAll("button.btn.btn-info")]
      .find(btn => btn.textContent.trim().toLowerCase().includes("search"));
    if (!searchBtn) {
      console.warn("⚠️ Search button not found.");
      return false;
    }
    searchBtn.click();
    console.log("🔍 Search button clicked.");
    return true;
  }

  if (!clickSearchButton()) return false;
  await wait(1000);

  // --- 6. CLICK ACTIVATE BUTTON ---
  async function clickActivateButton(timeout = 8000) {
    const start = performance.now();
    let activateBtn = null;
    
    while (performance.now() - start < timeout) {
      activateBtn = [...document.querySelectorAll("span.material-icons.green")]
        .find(el => el.textContent.trim() === "check_circle");
      if (activateBtn) break;
      await wait(200);
    }
    
    if (!activateBtn) {
      console.warn("⚠️ Activate button not found within timeout.");
      return false;
    }
    
    activateBtn.click();
    console.log("✅ Activate button clicked.");
    return true;
  }

  if (!(await clickActivateButton())) return false;
  await wait(1500); // Wait for activation modal

  // --- 7. READ ACTIVATION MESSAGE ---
  async function readActivationMessage() {
    let activationModalBody = null;
    
    // Wait for modal with content (max 5s)
    for (let i = 0; i < 50; i++) {
      activationModalBody = document.querySelector('.modal.show .modal-body');
      if (activationModalBody?.textContent.trim()) break;
      await wait(100);
    }
    
    if (!activationModalBody) {
      console.warn("⚠️ Activation modal not detected");
      return null;
    }
    
    // Fallback chain: direct p > any p > raw text
    const message = 
      activationModalBody.querySelector(':scope > p')?.textContent.trim() ||
      activationModalBody.querySelector('p')?.textContent.trim() ||
      activationModalBody.textContent.trim();
    
    console.log("📨 Activation Message:", message);
    return message;
  }

  const activationMessage = await readActivationMessage();
  
  // --- 8. AUTO-CLOSE IF SUCCESS ---
  async function closeModal(timeout = 8000) {
    const start = performance.now();
    let closeBtn = null;
    
    while (performance.now() - start < timeout) {
      closeBtn = [...document.querySelectorAll("button.btn.btn-small.btn-info")]
        .find(b => b.textContent.trim().toLowerCase() === "close");
      if (closeBtn) break;
      await wait(200);
    }
    
    if (closeBtn) {
      closeBtn.click();
      console.log("🚪 Modal closed.");
      await wait(500);
      return true;
    }
    
    console.warn("⚠️ Close button not found.");
    return false;
  }

  // Close modal if activation was successful
  if (activationMessage && 
      (activationMessage.toLowerCase().includes('success') || 
       activationMessage.toLowerCase().includes('activated') ||
       activationMessage.toLowerCase().includes('completed'))) {
    console.log("🎉 Activation successful! Closing modal...");
    await wait(1500);
    await closeModal();
  }

  console.log("✨ Activation flow completed.");
  return {
    success: true,
    message: activationMessage,
    iccid: gloable_icc_id,
    msisdn: gloable_msisdn
  };
}

//
// Wait for activation modal body WITH content
//
let activationModalBody = null;
for (let i = 0; i < 50; i++) {
  activationModalBody = document.querySelector('.modal.show .modal-body');
  if (activationModalBody?.textContent.trim()) break;
  await wait(100);
}
if (activationModalBody) {
  // Fallback chain: direct p > any p > raw text
  const msg = 
    activationModalBody.querySelector(':scope > p')?.textContent.trim() ||
    activationModalBody.querySelector('p')?.textContent.trim() ||
    activationModalBody.textContent.trim();
    console.log("✅ Activation Message:", msg);
  
  if (msg.toLowerCase().includes('Subscriber not found') || msg.toLowerCase().includes('not')) {
    if (iccidLog.length > 0) {
        const removed = iccidLog.pop();
        saveLog();
        console.log("🗑️ Removed failed entry:", removed);
      }
  }
  
  // Optional: Auto-close if success detected
  if (msg.toLowerCase().includes('success') || msg.toLowerCase().includes('activated')) {
    await wait(1500);
    await closeModal();
  }
} else {
  console.warn("⚠️ Activation modal not detected");
}

  
}
