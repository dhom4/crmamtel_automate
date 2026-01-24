// =========================================
// ENHANCED ICCID LOGGER (AUTO-MSISDN + DEDUPE + DELETE)
// =========================================

let gloable_icc_id = null;
let gloable_msisdn = null; // Auto-captured from table

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
    iccid: iccid.trim(),
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

// --- Export to CSV (MSISDN right after ICCID) ---
function download_log() {
  if (!iccidLog.length) {
    alert("No logs to export.");
    return;
  }

  const headers = [
    'ID',
    'Timestamp (ISO)',
    'Time (Mogadishu)',
    'ICCID',
    'MSISDN',
    'Status',
    'Notes'
  ];

  const rows = iccidLog.map(e => {
    const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
    return [
      e.id,
      escape(e.timestamp),
      escape(e.timeDisplay),
      `"=""${e.iccid}""`, // Excel-safe ICCID
      escape(e.msisdn),
      escape(e.status),
      escape(e.notes)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `ICCID-Log-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Expose to global scope (for console debugging) ---
window.saveIccid = saveIccid;
window.deleteLog = deleteLog;
window.clearAllLogs = clearAllLogs;
window.download_log = download_log;
window.iccidLog = iccidLog; // for inspection

// =========================================
// YOUR EXISTING PAGE1 / PAGE2 CODE (MINIMALLY MODIFIED)
// =========================================

function page1() {
  // ... (your existing page1 code unchanged) ...
  // No changes needed in page1
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

  fillFormFromConsole();
}

// =========================================
// PAGE2 — WITH AUTO MSISDN CAPTURE
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

  // =========================================
  // MSISDN SELECTION — WITH AUTO CAPTURE
  // =========================================
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
      console.warn(`Only ${checkboxes.length} MSISDN rows — cannot select 10th.`);
      return false;
    }

    const tenth = checkboxes[9];
    tenth.checked = true;
    ["click", "input", "change"].forEach((t) =>
      tenth.dispatchEvent(new Event(t, { bubbles: true }))
    );

    // ➕ AUTO-CAPTURE MSISDN FROM THE SAME ROW
    const msisdnRow = tenth.closest('tr');
    if (msisdnRow) {
      // Try common patterns — adjust if needed
      const msisdnCell =
        msisdnRow.cells[1] || // 2nd column
        msisdnRow.querySelector('td:nth-child(2)') ||
        msisdnRow.querySelector('td'); // fallback to first cell

      if (msisdnCell) {
        gloable_msisdn = msisdnCell.textContent.trim().replace(/\D/g, '');
        console.log("📱 Auto-captured MSISDN:", gloable_msisdn);
      }
    }

    const saveBtn = modal.querySelector("button.btn.btn-info.mx-2");
    if (!saveBtn) {
      console.warn("MSISDN save button missing.");
      return false;
    }

    await wait(300);
    saveBtn.click();
    console.log("MSISDN Done.");

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
  // ICCID HANDLING — LOG WITH MSISDN
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

    const suffix = prompt("Enter ICCID suffix (e.g. -1234567):");
    if (!suffix) return false;

    const ICCID_number = `8925263790000${suffix.replace(/^-/, '')}`;
    console.log(`🔍 Searching ICCID: ${ICCID_number}`);

    // ✅ LOG WITH AUTO-CAPTURED MSISDN
    saveIccid(ICCID_number, { msisdn: gloable_msisdn, status: 'pending_activation' });
    gloable_icc_id = ICCID_number;

    const searchInput = modal.querySelector("input#searchtextIMSI.form-control");
    if (!searchInput) {
      console.warn("ICCID search input not found.");
      return false;
    }
    searchInput.value = ICCID_number;
    ["input", "change", "keyup"].forEach((e) =>
      searchInput.dispatchEvent(new Event(e, { bubbles: true }))
    );

    const searchButton = modal.querySelector(".input-group-append button.btn.btn-info");
    if (!searchButton) {
      console.warn("ICCID search button not found.");
      return false;
    }
    searchButton.click();

    await wait(1000);
    console.log("ICCID done.");
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
// NEXT / ACTIVATION (unchanged)
// =========================================

async function next() {
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
  await wait(1000);

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

  await wait(1000);
  await closeModal();

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
    } catch (err) {
      console.error("❌ Copy failed:", err);
    }
    document.body.removeChild(textarea);
  }

  console.log(gloable_icc_id);
  copyToClipboard(gloable_icc_id);

  function clickHomeLogo() {
    const logo = document.querySelector("img.logoImg");
    if (logo) {
      logo.click();
      console.log("Home logo clicked.");
    } else {
      console.warn("Home logo not found.");
    }
  }

  function selectICCID() {
    const select = document.querySelector("select#idtype");
    if (!select) {
      console.warn("Dropdown not found.");
      return;
    }
    const option = [...select.options].find(
      opt => opt.textContent.trim().toLowerCase() === "iccid"
    );
    if (!option) {
      console.warn("ICCID option not found.");
      return;
    }
    select.value = option.value;
    select.dispatchEvent(new Event("change"));
    console.log("Dropdown changed to ICCID.");
  }

  function fillSearchBar() {
    const input = document.querySelector("input#number");
    if (!input) {
      console.warn("Search bar not found.");
      return;
    }
    input.value = gloable_icc_id;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("Search bar filled with:", gloable_icc_id);
  }

  function clickSearchButton() {
    const searchBtn = [...document.querySelectorAll("button.btn.btn-info")]
      .find(btn => btn.textContent.trim().toLowerCase().includes("search"));
    if (!searchBtn) {
      console.warn("Search button not found.");
      return;
    }
    searchBtn.click();
    console.log("Search button clicked.");
  }

  async function clickActivateButton(timeout = 8000) {
    const start = performance.now();
    let activateBtn = null;

    while (performance.now() - start < timeout) {
      activateBtn = [...document.querySelectorAll("span.material-icons.green")]
        .find(el => el.textContent.trim() === "check_circle");
      if (activateBtn) break;
      await new Promise(res => setTimeout(res, 200));
    }

    if (!activateBtn) {
      console.warn("Activate button not found.");
      return;
    }

    activateBtn.click();
    console.log("Activate button clicked.");
  }

  await wait(1000);
  clickHomeLogo();
  selectICCID();
  fillSearchBar();
  clickSearchButton();
  await clickActivateButton();
}
