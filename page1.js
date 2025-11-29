function fillFormFromConsole() {
    // --- Helper Functions ---
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const generateRandomId = (length) => 
        Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    
    // Use dispatchEvent instead of separate dispatchInput/dispatchChange
    const dispatchEvent = (element, type = 'input') => 
        element.dispatchEvent(new Event(type, { bubbles: true }));

    // --- Data Preparation ---
    const today = new Date();
    const expiryDateObj = new Date(today);
    expiryDateObj.setFullYear(today.getFullYear() + 5); 
    const randomID = generateRandomId(10);
    const issueDate = formatDate(today);
    const expiryDate = formatDate(expiryDateObj);
    const phoneNumber = "252716408296";

    console.log("-> Starting Form Fill and Validation...");

    // --- 1. BASIC INFO (Fill & Validate) ---
    const firstName = document.getElementById("firstName");
    if (firstName) { firstName.value = "Amtel"; dispatchEvent(firstName); }
    const middleName = document.getElementById("middleName");
    if (middleName) { middleName.value = "Amtel"; dispatchEvent(middleName); }
    const lastName = document.getElementById("lastName");
    if (lastName) { lastName.value = "Amtel"; dispatchEvent(lastName); }
    const address = document.getElementById("address");
    if (address) { address.value = "Qardho"; dispatchEvent(address); }
    const gender = document.getElementById("gender");
    if (gender) { gender.value = "1"; dispatchEvent(gender, 'change'); } // Use 'change'

    // --- 2. CLICK 'Add New Identity' ---
    const initialButtons = document.querySelectorAll(".btn-info");
    let foundAddButton = null;

    for (const button of initialButtons) {
        if (button.textContent.trim() === "Add New Identity") {
            foundAddButton = button;
            break;
        }
    }

    if (foundAddButton) {
        foundAddButton.click();
        console.log("-> 'Add New Identity' clicked. Waiting 1.5s for fields to load...");
    } else {
        console.error("❌ ERROR: 'Add New Identity' button not found.");
        return; 
    }

    // --- 3. START TIMED EXECUTION (1500ms initial wait) ---
    setTimeout(() => {
        
        // --- A. FILL NEWLY ADDED ID FIELDS (Validate) ---
        
        const idInput = document.getElementById("idnumber");
        if (idInput) { idInput.value = randomID; dispatchEvent(idInput); }
        const issuerInput = document.getElementById("issuer");
        if (issuerInput) { issuerInput.value = "Ministry of Commerce & Industry"; dispatchEvent(issuerInput, 'change'); }
        
        const issueDateInput = document.getElementById("issuedate");
        if (issueDateInput) { issueDateInput.value = issueDate; dispatchEvent(issueDateInput); }
        
        const expiryDateInput = document.getElementById("expirydate");
        if (expiryDateInput) { expiryDateInput.value = expiryDate; dispatchEvent(expiryDateInput); }

        // --- B. FILL NEXT OF KIN (Validate) ---
        const nextkinfname = document.getElementById("nextkinfname");
        if (nextkinfname) { nextkinfname.value = "Amtel"; dispatchEvent(nextkinfname); }
        const nextkinsname = document.getElementById("nextkinsname");
        if (nextkinsname) { nextkinsname.value = "Amtel"; dispatchEvent(nextkinsname); }
        const nextkintname = document.getElementById("nextkintname");
        if (nextkintname) { nextkintname.value = "Amtel"; dispatchEvent(nextkintname); }
        const nextkinmsisdn = document.getElementById("nextkinmsisdn");
        if (nextkinmsisdn) { nextkinmsisdn.value = phoneNumber; dispatchEvent(nextkinmsisdn); }
        const alternativeMsisdn = document.getElementById("alternativeMsisdn");
        if (alternativeMsisdn) { alternativeMsisdn.value = phoneNumber; dispatchEvent(alternativeMsisdn); }
        
        console.log("-> All non-cascading fields filled.");

        // --- C. STAGE 1: Select mdomain (and schedule next step) ---
        const mdomain = document.getElementById("mdomain");
        if (mdomain) {
            mdomain.value = "HZvOmetzvIQeEKFSEkdz";
            dispatchEvent(mdomain, 'change'); 
            console.log("mdomain set. Waiting for mzone to load...");
        }

        // --- D. STAGE 2: Schedule mzone Selection (Wait 500ms) ---
        setTimeout(() => {
            const mzone = document.getElementById("mzone");
            if (mzone) {
                mzone.value = "01DJSVS67JT0PDVE8KR0615C4E";
                dispatchEvent(mzone, 'change'); 
                console.log("mzone set. Waiting for marea to load...");
            }

            // --- E. STAGE 3: Schedule marea & Final Submission (Wait 500ms) ---
            setTimeout(() => {
                const marea = document.getElementById("marea");
                if (marea) {
                    marea.value = "01DK17S11C4RFZTE6RTVRAGJJW";
                    dispatchEvent(marea, 'change'); 
                    console.log("marea set successfully.");
                }

                // --- F. Schedule FINAL 'Save' Click (Wait 500ms) ---
                // Final brief pause to ensure all validation completes before clicking Save.
                setTimeout(() => {
                    const specificSubmitButton = document.querySelector('.btn-info[type="submit"]');

                    if (specificSubmitButton) {
                        specificSubmitButton.click(); 
                        console.log("✅ Submission SUCCESS! 'Save' button clicked.");
                    } else {
                        console.error("❌ ERROR: Final 'Save' button not found.");
                    }
                }, 500); 

            }, 500); // Wait 500ms for marea options to load

        }, 500); // Wait 500ms for mzone options to load

    }, 1500); // Initial 1500ms wait
}

fillFormFromConsole();
