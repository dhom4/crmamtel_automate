// =========================================
// SIMPLE ICCID LOGGER (WITH AUTO-SAVE)
// =========================================
let iccidLog = JSON.parse(localStorage.getItem('iccidLog') || '[]');
let logCount = parseInt(localStorage.getItem('iccidCount') || '0');

function saveIccid(iccid) {
  logCount++;
  iccidLog.push({
    id: logCount,
    time: new Date().toLocaleString('en-US', { timeZone: 'Africa/Mogadishu' }),
    iccid: iccid
  });
  localStorage.setItem('iccidLog', JSON.stringify(iccidLog));
  localStorage.setItem('iccidCount', logCount);
  console.log(`📝 #${logCount}: ${iccid}`);
  
  // ✅ AUTO-SAVE EVERY 10 ENTRIES
  if (logCount % 10 === 0) {
    downloadLog();
  }
}

function downloadLog() {
  if (!iccidLog.length) return;
  const csv = ['ID,Time,ICCID', 
    ...iccidLog.map(e => `${e.id},"${e.time}","${e.iccid}"`)].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv'}));
  a.download = `ICCID-Logs/${new Date().toISOString().split('T')[0]}-${logCount}.csv`;
  a.click();
  console.log(`💾 AUTO-SAVED ${iccidLog.length} ICCIDs!`);
}



saveIccid(term);  // ← ADD THIS LINE


// downloadLog();
