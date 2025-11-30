function Page1(){
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

    const TARGET_DOMAIN = "HZvOmetzvIQeEKFSEkdz";            // Somalia
    const TARGET_ZONE = "01DJSVS67JT0PDVE8KR0615C4E";        // ZONE 2
    const TARGET_AREA = "01DK17S11C4RFZTE6RTVRAGJJW";        // Qardho_KARKAAR

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
        setInputValueById(
            "issuer",
            "Ministry of Commerce & Industry",
            "change"
        );
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
        pollForOption(
            zoneSelect,
            TARGET_ZONE,
            "4.2 Zone",
            () => {
                console.log("Zone selection complete. Polling for area...");
                pollForOption(
                    areaSelect,
                    TARGET_AREA,
                    "4.3 Area",
                    () => {
                        console.log("All dropdown selections complete 🎉");
                        onLocationSelectionComplete(areaSelect);
                    }
                );
            }
        );
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
    if (!openIdentitySection()) { // If identity cannot be opened, stop early
        return; }
    fillIdentitySection();
    fillNextOfKinSection();
    selectLocationWithPolling();
}
  fillFormFromConsole()
}

function Page2(){

  // Prepaid checkbox 
  function checkPrepaidCheckbox() {
    const checkbox = document.getElementById("isprepaid");
    if (!checkbox) {
        console.warn('Checkbox with id "isprepaid" not found.');
        return;
    }
    // Set checked state
    checkbox.checked = true; // [web:77][web:89]
    // Notify Angular/mdbcheckbox by firing common events
    ["click", "input", "change"].forEach((type) => {
        checkbox.dispatchEvent(new Event(type, { bubbles: true }));
    });
    console.log("Prepaid checkbox checked ✅");
  } 
  // run it
  checkPrepaidCheckbox();


  function selectIccidRadio() {
      const radio = document.getElementById("iccid");
      if (!radio) {
          console.warn('Radio with id "iccid" not found.');
          return;
      }
      // Set it as selected
      radio.checked = true; // [web:98][web:95]
      // Fire events so Angular / any listeners react
      ["click", "input", "change"].forEach(type => {
          radio.dispatchEvent(new Event(type, { bubbles: true }));
      });
      console.log("Radio #iccid selected ✅");
  }
  // run it
  selectIccidRadio();


  function clickAddAttachPlan() {
      // 1. Click the add button
      const addBtn1 = document.querySelectorAll('button.btn-info:has(.material-icons)')[0];
      
      if (!addBtn1) {
          console.warn('Add button (btn-info with material-icons) not found.');
          return;
      }

      addBtn1.click();
      ["click"].forEach(type => {
          addBtn1.dispatchEvent(new Event(type, { bubbles: true }));
      });
      console.log("Add Attach Plan button clicked ✅");

      // 2. Wait LONGER for modal/popup to fully load, then select Base plan
      setTimeout(() => {
          console.log("Looking for Base plan...");
          
          const basePlanCard = [...document.querySelectorAll('.card-container')]
              .find(card => card.querySelector('.heading.bold.red')?.textContent.trim() === 'Base plan');
          
          if (!basePlanCard) {
              console.warn('Base plan card not found.');
              return;
          }

          basePlanCard.click();
          ["click"].forEach(type => {
              basePlanCard.dispatchEvent(new Event(type, { bubbles: true }));
          });
          console.log("Base plan selected ✅");

          // 3. Wait, then click Save
          setTimeout(() => {
            // 3. Click Save
            const saveBtn = [...document.querySelectorAll('button.btn-info')]
                .find(btn => btn.textContent.trim() === 'Save');
            if (!saveBtn) {
                console.warn('Save button not found.');
                return;
            }
            saveBtn.click();
          }, 300);

      }, 1000); // INCREASED to 1.5 seconds for slower modal load
  }
  // run it
  clickAddAttachPlan();

  
function addMsisdnSeries() {
    // 1) Click the second Add button (MSISDN Number Series)
    const addButtons = document.querySelectorAll('button.btn-info:has(.material-icons)');
    const addBtn = addButtons[1]; // index 1 = MSISDN Add
    if (!addBtn) {
        console.warn('MSISDN Add button not found.');
        return;
    }
    addBtn.click();
    console.log("1. MSISDN Add button clicked ✅");

    // 2) Wait for table, select first checkbox, THEN click Save
    setTimeout(() => {
        const checkboxes = document.querySelectorAll('table input.form-check-input[type="checkbox"]');
        console.log("MSISDN checkboxes found:", checkboxes.length);

        if (!checkboxes.length) {
            console.warn("No MSISDN checkboxes found.");
            return;
        }

        const cb = checkboxes[0]; // first number
        cb.checked = true;
        ["click", "input", "change"].forEach(type =>
            cb.dispatchEvent(new Event(type, { bubbles: true }))
        );
        console.log("2. MSISDN row selected ✅");

        // 3) After selection, click the Save in MSISDN modal
        setTimeout(() => {
            const modal = [...document.querySelectorAll('.modal-content')]
                .find(m => m.textContent.includes('MSISDN List'));
            if (!modal) {
                console.warn('MSISDN modal not found.');
                return;
            }

            const footerRow = modal.querySelector('.row.my-4 .col-12.d-flex.justify-content-end');
            if (!footerRow) {
                console.warn('Footer row with Save/Reset not found.');
                return;
            }

            const saveBtn = footerRow.querySelector('button.btn.btn-info.mx-2');
            if (!saveBtn) {
                console.warn('Save button in footer not found.');
                return;
            }

            saveBtn.click();
            console.log('3. MSISDN modal Save clicked ✅');
        }, 400); // small delay after checkbox to let UI update

    }, 1200); // wait for list to render
}

  // run it
  addMsisdnSeries();


}


