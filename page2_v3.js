function Page1() {
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

    // Simple sleep helper (kept in case you want manual waits later)
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // =========================
    // Static data
    // =========================

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

    // =========================
    // Step 1: Basic info
    // =========================

    const fillBasicInfo = () => {
      setInputValueById("firstName", "Amtel");
      setInputValueById("middleName", "Amtel");
      setInputValueById("lastName", "Amtel");
      setInputValueById("address", "Qardho");
      setInputValueById("gender", "1", "change");
      console.log("Step 1: Basic info filled ✅");
    };

    // =========================
    // Step 2: Identity section
    // =========================

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

    // =========================
    // Step 3: Next of kin
    // =========================

    const fillNextOfKinSection = () => {
      setInputValueById("nextkinfname", "Amtel");
      setInputValueById("nextkinsname", "Amtel");
      setInputValueById("nextkintname", "Amtel");
      setInputValueById("nextkinmsisdn", phoneNumber);
      setInputValueById("alternativeMsisdn", phoneNumber);
      console.log("Step 3: Next of kin filled ✅");
    };

    // =========================
    // Step 4: Domain / Zone / Area selection
    // =========================

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

      // 1. Select domain
      domainSelect.value = TARGET_DOMAIN;
      dispatchAllChangeEvents(domainSelect);
      console.log("4.1 Domain selected.");

      // 2. Poll for zone, then area
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
        console.log("Step 4: 'Next' clicked. Moving to next step...");
      } else {
        console.warn("Could not find 'Next' button after location selection.");
      }
    };

    // =========================
    // Run all steps
    // =========================

    fillBasicInfo();
    if (!openIdentitySection()) {
      return;  // If identity cannot be opened, stop early
    }
    fillIdentitySection();
    fillNextOfKinSection();
    selectLocationWithPolling();
  }
  
  fillFormFromConsole();
}

async function Page2() {

  // -----------------------------------------
  // 1. PREPAID CHECKBOX
  // -----------------------------------------
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

  checkPrepaidCheckbox();   // MUST RUN BEFORE ATTACH PLAN


  // -----------------------------------------
  // 2. ATTACH PLAN (WAIT UNTIL COMPLETED)
  // -----------------------------------------
  async function clickAddAttachPlan() {
    console.log("Starting Attach Plan…");

    const addIcon = [...document.querySelectorAll("button.btn-info .material-icons")]
      .find(span => span.textContent.trim() === "add");

    if (!addIcon) {
      console.warn("Attach Plan +Add button not found.");
      return false;
    }

    const addBtn = addIcon.closest("button");
    addBtn.click();
    console.log("Attach Plan button clicked.");

    // Wait for modal
    let modal = null;
    for (let i = 0; i < 40; i++) {
      modal = document.querySelector(".modal-content");
      if (modal) break;
      await new Promise(r => setTimeout(r, 100));
    }
    if (!modal) {
      console.warn("Product Catalog modal did not load.");
      return false;
    }
    console.log("Attach Plan modal opened.");

    // Find Base Plan
    let basePlan = null;
    for (let i = 0; i < 40; i++) {
      basePlan = [...modal.querySelectorAll(".card-container")]
        .find(c => c.querySelector(".heading.bold.red")?.textContent.trim() === "Base plan");
      if (basePlan) break;
      await new Promise(r => setTimeout(r, 100));
    }
    if (!basePlan) {
      console.warn("Base plan not found in modal.");
      return false;
    }

    basePlan.click();
    console.log("Base Plan selected.");

    // Save button
    let saveBtn = null;
    for (let i = 0; i < 40; i++) {
      saveBtn = modal.querySelector("button.btn.btn-info.mx-2");
      if (saveBtn) break;
      await new Promise(r => setTimeout(r, 100));
    }

    if (!saveBtn) {
      console.warn("Attach Plan Save button not found.");
      return false;
    }

    saveBtn.click();
    console.log("Attach Plan saved.");

    // Wait for modal to close
    for (let i = 0; i < 40; i++) {
      if (!document.querySelector(".modal-content")) break;
      await new Promise(r => setTimeout(r, 100));
    }

    console.log("Attach Plan COMPLETED 🎉");
    return true;
  }


  const attachDone = await clickAddAttachPlan();
  if (!attachDone) {
    console.error("Attach plan failed. Stopping Page2.");
    return;
  }


  // -----------------------------------------
  // 3. ADD MSISDN SERIES (AFTER ATTACH PLAN)
  // -----------------------------------------
  async function addMsisdnSeries() {

    const icons = [...document.querySelectorAll("button.btn-info .material-icons")]
      .filter(s => s.textContent.trim() === "add");

    const addBtn = icons[1]?.closest("button");
    if (!addBtn) {
      console.warn("MSISDN Add button not found.");
      return false;
    }

    addBtn.click();
    console.log("MSISDN Add clicked.");

    // Wait modal
    let modal = null;
    for (let i = 0; i < 20; i++) {
      modal = [...document.querySelectorAll(".modal-content")]
        .find(m => m.textContent.includes("MSISDN List"));
      if (modal) break;
      await new Promise(r => setTimeout(r, 100));
    }

    if (!modal) {
      console.warn("MSISDN modal not found.");
      return false;
    }

    const first = modal.querySelector('table input.form-check-input[type="checkbox"]');
    if (!first) {
      console.warn("MSISDN checkbox missing.");
      return false;
    }

    first.checked = true;
    ["click", "input", "change"].forEach(t =>
      first.dispatchEvent(new Event(t, { bubbles: true }))
    );
    console.log("MSISDN selected.");

    const saveBtn = modal.querySelector("button.btn.btn-info.mx-2");
    if (!saveBtn) {
      console.warn("MSISDN save button missing.");
      return false;
    }

    saveBtn.click();
    console.log("MSISDN saved.");
    return true;
  }


  const msisdnDone = await addMsisdnSeries();
  if (!msisdnDone) {
    console.error("MSISDN failed.");
    return;
  }


  // -----------------------------------------
  // 4. ICCID RADIO + ICCID MODAL
  // -----------------------------------------
  function selectIccidRadio() {
    const radio = document.getElementById("iccid");
    if (!radio) return false;

    radio.checked = true;
    ["click", "input", "change"].forEach(evt =>
      radio.dispatchEvent(new Event(evt, { bubbles: true }))
    );
    console.log("ICCID radio selected.");
    return true;
  }

  async function handleIccid() {

    const addIcons = [...document.querySelectorAll("button.btn.btn-info .material-icons")]
      .filter(s => s.textContent.trim() === "add");

    const addBtn = addIcons[2]?.closest("button");
    if (!addBtn) {
      console.warn("ICCID Add button not found.");
      return false;
    }

    addBtn.click();
    console.log("ICCID Add clicked.");

    await new Promise(r => setTimeout(r, 800));

    const modal = [...document.querySelectorAll(".modal-content")]
      .find(m => m.textContent.includes("IMSI List"));

    if (!modal) {
      console.warn("ICCID modal not found.");
      return false;
    }


    const term = prompt("Enter IMSI search term:");
    if (!term) return false;

    const searchInput = modal.querySelector("input#searchtextIMSI.form-control");
    searchInput.value = term;
    ["input", "change", "keyup"].forEach(e =>
      searchInput.dispatchEvent(new Event(e, { bubbles: true }))
    );

    const searchButton = modal.querySelector(".input-group-append button.btn.btn-info")?.closest("button");
    searchButton.click();

    await new Promise(r => setTimeout(r, 1000));

    const first = modal.querySelector('table input.form-check-input[type="checkbox"]');
    if (!first) return false;

    first.checked = true;
    ["click", "input", "change"].forEach(e =>
      first.dispatchEvent(new Event(e, { bubbles: true }))
    );

    const saveBtn = modal.querySelector("button.btn.btn-info.mx-2");
    saveBtn.click();
    console.log("ICCID saved.");

    return true;
  }

  if (selectIccidRadio()) {
    await handleIccid();
  }


  // -----------------------------------------
  // 5. CLICK NEXT TWICE
  // -----------------------------------------
  function clickThirdPageNext() {
    const btn = [...document.querySelectorAll("button.btn.btn-info")]
      .find(b => b.textContent.trim() === "Next");

    if (btn) {
      btn.click();
      console.log("Next clicked.");
    }
  }
  clickThirdPageNext();

  
// -----------------------------------------
// 5. PAGE 3 NEXT
// -----------------------------------------
async function goToPage3() {
  console.log("Trying to click Next (Page 3)…");

  let nextBtn = null;
  for (let i = 0; i < 30; i++) {
    nextBtn = [...document.querySelectorAll("button.btn.btn-info")]
      .find(btn => btn.textContent.trim() === "Next");
    if (nextBtn) break;
    await new Promise(r => setTimeout(r, 150));
  }

  if (!nextBtn) {
    console.warn("Next button for Page 3 not found.");
    return false;
  }

  nextBtn.click();
  console.log("Next clicked → Moved to Page 3.");
  await new Promise(r => setTimeout(r, 800)); // small UI wait

  return true;
}


// -----------------------------------------
// 6. PAGE 4 CHECKOUT
// -----------------------------------------
async function checkoutPage() {
  console.log("Trying to click Checkout (Page 4)…");

  let checkoutBtn = null;
  for (let i = 0; i < 30; i++) {
    checkoutBtn = [...document.querySelectorAll("button.btn.btn-info")]
      .find(b => b.textContent.trim().toLowerCase() === "checkout");
    if (checkoutBtn) break;
    await new Promise(r => setTimeout(r, 150));
  }

  if (!checkoutBtn) {
    console.warn("Checkout button not found.");
    return false;
  }

  checkoutBtn.click();
  console.log("Checkout clicked → Order submitted!");
  return true;
}

// After ICCID is done:
await goToPage3();
await goToPage3();   // second Next if page 3 → page 4
}
// await checkoutPage();
