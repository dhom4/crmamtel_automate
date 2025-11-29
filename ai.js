// Helper to dispatch the change event for selects and buttons
const dispatchEvent = (element, type = 'change') => 
    element.dispatchEvent(new Event(type, { bubbles: true }));

// --- Function to handle all actions on the new Provisioning page ---
function provisioningPageActions(imsiNumber) {

    console.log("-> Starting Provisioning Page Actions...");

    // 1. Click 'Prepaid' (Assuming it's a radio button or button with the class 'btn-info')
    const prepaidButton = document.querySelector('button.btn-info'); // Use a more specific selector if possible
    if (prepaidButton && prepaidButton.textContent.trim().toLowerCase() === 'prepaid') {
        prepaidButton.click();
        console.log("1. Prepaid button clicked.");
    } else {
        console.error("❌ Prepaid button not found.");
    }

    // 2. Click 'ICC ID' radio button/option
    const iccidOption = document.getElementById('iccid'); // Assuming the ICC ID option has this ID
    if (iccidOption) {
        iccidOption.click();
        dispatchEvent(iccidOption, 'change'); // Trigger validation/load
        console.log("2. ICC ID option clicked.");
    } else {
        console.error("❌ ICC ID option not found.");
    }

    // 3. Click 'Attach Plan' button (Needs a pause after ICC ID click, 500ms should be safe)
    setTimeout(() => {
        const attachPlanButton = document.querySelector('button[title="Attach Plan"]'); // Assuming button has title or specific ID
        if (attachPlanButton) {
            attachPlanButton.click();
            console.log("3a. 'Attach Plan' button clicked. Waiting for plan dropdown...");

            // Wait for the plan dropdown/modal to appear (e.g., 500ms)
            setTimeout(() => {
                // Assuming the plan dropdown ID is 'planDropdown' and we select the first option (index 1)
                const planDropdown = document.getElementById('planDropdown'); 
                if (planDropdown) {
                    // Set value of the first available option (assuming a value or index)
                    planDropdown.selectedIndex = 1; 
                    dispatchEvent(planDropdown, 'change');
                    console.log("3b. Plan selected.");
                } else {
                    console.error("❌ Plan dropdown not found.");
                }
                
                // Click 'Save' button for the plan
                const planSaveButton = document.querySelector('button[type="submit"][title="Save"]'); // Assuming specific save button
                if (planSaveButton) {
                    planSaveButton.click();
                    console.log("3c. Plan saved.");
                } else {
                    console.error("❌ Plan Save button not found.");
                }

            }, 500); // Wait for plan dropdown/modal
        } else {
            console.error("❌ Attach Plan button not found.");
        }

    }, 500); // Wait after ICC ID selection

    // --- 4. MSISDN Number Series Selection (Needs a pause, running in 2000ms from start) ---
    setTimeout(() => {
        const msisdnDropdown = document.getElementById('msisdnSeries'); // Assuming the MSISDN Series dropdown ID
        if (msisdnDropdown) {
            // Select the first valid option in the dropdown (index 1)
            msisdnDropdown.selectedIndex = 1; 
            dispatchEvent(msisdnDropdown, 'change');
            console.log("4. MSISDN Number Series selected (Index 1).");
        } else {
            console.error("❌ MSISDN Series dropdown not found.");
        }
        
        // No explicit scroll needed, but click save right after
        const msisdnSaveButton = document.getElementById('msisdnSave'); // Assuming specific save button ID
        if (msisdnSaveButton) {
            msisdnSaveButton.click();
            console.log("4. MSISDN series saved.");
        } else {
            console.error("❌ MSISDN Save button not found.");
        }

    }, 2000); 

    // --- 5. IMSI Search, Select, and Save (Needs a pause, running in 3000ms from start) ---
    setTimeout(() => {
        
        // A. Search for IMSI (Assuming there is an input field and a search button)
        const imsiInput = document.getElementById('imsiInput');
        if (imsiInput && imsiNumber) {
            imsiInput.value = imsiNumber;
            dispatchEvent(imsiInput, 'input');
            console.log(`5a. IMSI input field set to: ${imsiNumber}`);

            const imsiSearchButton = document.getElementById('imsiSearch'); // Assuming ID for search button
            if (imsiSearchButton) {
                imsiSearchButton.click();
                console.log("IMSI Search button clicked. Waiting for results...");
            }
        } else {
             console.error("❌ IMSI input field or IMSI number not provided.");
             return;
        }

        // B. Wait for search results and select the first one (e.g., 1000ms)
        setTimeout(() => {
            const imsiResultSelect = document.querySelector('.imsi-result-list input[type="radio"]'); // Assuming result is selectable via radio
            if (imsiResultSelect) {
                imsiResultSelect.click();
                dispatchEvent(imsiResultSelect, 'change');
                console.log("5b. IMSI result selected.");
            } else {
                console.error("❌ IMSI search result not found.");
            }

            // C. Click IMSI Save button
            const imsiSaveButton = document.getElementById('imsiSave'); // Assuming save button ID
            if (imsiSaveButton) {
                imsiSaveButton.click();
                console.log("5c. IMSI saved.");
            } else {
                console.error("❌ IMSI Save button not found.");
            }

        }, 1000); // Wait for search results to load

    }, 3000); // Run IMSI actions after other sections have started

    console.log("-> Scheduled all provisioning actions.");
}

// --- Execution Trigger ---
// Get IMSI from user input, then run the script.
const imsi = prompt("Please enter the IMSI number:");

if (imsi) {
    provisioningPageActions(imsi);
} else {
    console.warn("IMSI not provided. Provisioning script aborted.");
}
