function fillFormFromConsole() {

  // -- 1. basic info --
    document.getElementById("firstName").value = "Amtel";
    document.getElementById("middleName").value = "Amtel";
    document.getElementById("lastName").value = "Amtel";
    document.getElementById("address").value = "Qardho";
    document.getElementById("gender").value = "1";

  // -- 2. ID --
  const allInfoButtons = document.querySelectorAll(".btn-info");
  let foundButton = null;
  // Loop through the list of buttons
  for (const button of allInfoButtons) {
      // Check if the button's visible text (textContent) matches the target text
      if (button.textContent.trim() === "Add New Identity") {
          foundButton = button;
          break; // Stop looping once the correct button is found
      }
  }
  if (foundButton) {
      foundButton.click();
  } 


  //  issue id random num
  // Helper function to generate a 10-digit number string
  const generateRandomId = (length) => Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  const randomID = generateRandomId(10);
  // Set the random ID
  document.getElementById("idnumber").value = randomID;
  document.getElementById("issuer").value = "Ministry of Commerce & Industry";

  // Set the current date
  // Helper to format a Date object into YYYY-MM-DD
  const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // Calculate Dates
  const today = new Date();
  const expiryDateObj = new Date(today);
  expiryDateObj.setFullYear(today.getFullYear() + 5);
  // Dates
  document.getElementById("issuedate").value = formatDate(today);       // Today's date
  document.getElementById("expirydate").value = formatDate(expiryDateObj); // 5 years from today


  // save 
  // Targets any element with class .btn-info AND attribute type="submit"
  const specificSubmitButton = document.querySelector('.btn-info[type="submit"]');
  if (specificSubmitButton) {
      specificSubmitButton.click();
  }

  // 2.  -- My Cash -- 
  document.getElementById("mdomain").value = "HZvOmetzvIQeEKFSEkdz";
  document.getElementById("mzone").value = "01DJSVS67JT0PDVE8KR0615C4E";
  document.getElementById("marea").value = "01DK17S11C4RFZTE6RTVRAGJJW";

  // --- Set Name Fields to "Amtel" ---
  document.getElementById("nextkinfname").value = "Amtel";
  document.getElementById("nextkinsname").value = "Amtel";
  document.getElementById("nextkintname").value = "Amtel";

  // --- Set Phone Number Fields to "252716408296" ---
  const phoneNumber = "252716408296";
  document.getElementById("nextkinmsisdn").value = phoneNumber;
  document.getElementById("alternativeMsisdn").value = phoneNumber;

  // -- Next btn --
  // let nextButton = null;
  // for (const button of allInfoButtons) {
  //     if (button.textContent.trim() === "Next") {
  //         nextButton = button;
  //         break; 
  //     }
  // }
  // if (nextButton) {
  //     nextButton.click();
  // }

}

fillFormFromConsole()
