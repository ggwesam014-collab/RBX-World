// User Data
let userData = {
    username: '',
    robloxUsername: '',
    displayName: '',
    userId: '',
    points: 1000,
    level: 1,
    spinHistory: [],
    transactions: [],
    totalSpins: 0,
    adsWatched: 0
};

// Wheel Prizes - مع نسبة فوز 0.01% للجوائز الكبيرة
const prizes = [10, 20, 50, 100, 200, 500, 1000, 2000];
const prizeNames = ['10 Points', '20 Points', '50 Points', '100 Points', '200 Points', '500 Points', '1000 Points (Rare!)', 'JACKPOT 2000 (Ultra Rare!)'];
const prizeColors = ['#f5f5f5', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0', '#a0a0a0', '#505050', '#000000'];

// Initialize
let wheelCanvas = document.getElementById('wheelCanvas');
let ctx = wheelCanvas.getContext('2d');
let currentAngle = 0;
let isSpinning = false;

window.onload = function() {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000);
    
    drawWheel();
    loadUserData();
    updateRobuxEquivalent();
    
    // Load popunder ad
    loadPopUnderAd();
};

// Load PopUnder Ad
function loadPopUnderAd() {
    var a = document.createElement('script');
    a.src = "//marathon-male-trifle.com/50c2b920e2447ecdd963e7be50db8af9/pop.js";
    a.async = true;
    document.getElementById('popad-container').appendChild(a);
}

// Draw Wheel
function drawWheel() {
    let angleStep = (Math.PI * 2) / prizes.length;
    
    for (let i = 0; i < prizes.length; i++) {
        let startAngle = i * angleStep;
        let endAngle = (i + 1) * angleStep;
        
        ctx.beginPath();
        ctx.moveTo(175, 175);
        ctx.arc(175, 175, 160, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = prizeColors[i];
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(175, 175);
        ctx.rotate(startAngle + angleStep / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = i === 7 ? '#fff' : '#000';
        ctx.font = 'bold 12px Montserrat';
        ctx.fillText(prizes[i].toString(), 110, 10);
        ctx.restore();
    }
    
    ctx.beginPath();
    ctx.arc(175, 175, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.stroke();
}

// Check Username with Roblox API
async function checkUsername() {
    let username = document.getElementById('roblox-username').value.trim();
    let errorDiv = document.getElementById('login-error');
    
    if (username.length < 3) {
        showError('Please enter a valid username');
        return;
    }
    
    showError('Searching for user...', 'blue');
    
    try {
        let response = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
        let data = await response.json();
        
        if (data.Id) {
            let userId = data.Id;
            
            let userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
            let userDetails = await userResponse.json();
            
            let avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;
            
            document.getElementById('verify-avatar').src = avatarUrl;
            document.getElementById('verify-displayname').textContent = userDetails.displayName || data.Username;
            document.getElementById('verify-username').textContent = `@${data.Username}`;
            
            userData.robloxUsername = data.Username;
            userData.displayName = userDetails.displayName || data.Username;
            userData.userId = userId;
            
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('verification-screen').style.display = 'flex';
            errorDiv.style.display = 'none';
        } else {
            showError('User not found. Using demo account...');
            useMockUserData(username);
        }
    } catch (error) {
        console.log('API Error:', error);
        showError('Using demo account...');
        useMockUserData(username);
    }
}

// Show error message
function showError(message, color = 'red') {
    let errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'block';
    errorDiv.style.color = color;
    errorDiv.textContent = message;
}

// Use mock user data
function useMockUserData(username) {
    let mockUserId = Math.floor(Math.random() * 1000000);
    
    document.getElementById('verify-avatar').src = 
        'https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png';
    document.getElementById('verify-displayname').textContent = username;
    document.getElementById('verify-username').textContent = `@${username}`;
    
    userData.robloxUsername = username;
    userData.displayName = username;
    userData.userId = mockUserId;
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('verification-screen').style.display = 'flex';
    document.getElementById('login-error').style.display = 'none';
}

// Confirm Identity
function confirmIdentity(isConfirmed) {
    if (isConfirmed) {
        let avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userData.userId || 1}&width=150&height=150&format=png`;
        document.getElementById('sidebar-avatar').src = avatarUrl;
        document.getElementById('sidebar-username').textContent = userData.displayName;
        
        document.getElementById('verification-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        
        updateUI();
        saveUserData();
    } else {
        document.getElementById('verification-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
    }
}

// Start Ad Sequence
function startAdSequence() {
    if (isSpinning) {
        alert('Wheel is spinning!');
        return;
    }
    
    userData.adsWatched = 0;
    watchNextAd();
}

// Watch Next Ad
function watchNextAd() {
    if (userData.adsWatched >= 2) {
        spinWheel();
        return;
    }
    
    let adNumber = userData.adsWatched + 1;
    
    // إظهار إعلان منبثق
    showPopupAd();
    
    // محاكاة مشاهدة الإعلان
    setTimeout(() => {
        userData.adsWatched++;
        
        if (userData.adsWatched < 2) {
            setTimeout(() => {
                watchNextAd();
            }, 500);
        } else {
            spinWheel();
        }
    }, 3000);
}

// Show Popup Ad
function showPopupAd() {
    // فتح نافذة إعلان منبثقة
    var popup = window.open('https://marathon-male-trifle.com/50c2b920e2447ecdd963e7be50db8af9/', '_blank', 'width=400,height=400');
    
    // إذا منع المتصفح النافذة المنبثقة، استخدم الإعلان داخل الصفحة
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
        alert('Please allow popups to watch ads and earn points!');
        
        // إظهار إعلان داخلي بديل
        let adContainer = document.createElement('div');
        adContainer.style.position = 'fixed';
        adContainer.style.top = '50%';
        adContainer.style.left = '50%';
        adContainer.style.transform = 'translate(-50%, -50%)';
        adContainer.style.zIndex = '10001';
        adContainer.style.background = 'white';
        adContainer.style.padding = '20px';
        adContainer.style.border = '3px solid black';
        adContainer.style.borderRadius = '10px';
        adContainer.innerHTML = '<iframe src="//marathon-male-trifle.com/50c2b920e2447ecdd963e7be50db8af9/invoke.html" width="300" height="250" frameborder="0"></iframe><br><button onclick="this.parentElement.remove()" style="margin-top:10px; padding:5px 10px;">Close Ad</button>';
        document.body.appendChild(adContainer);
        
        setTimeout(() => {
            if (document.body.contains(adContainer)) {
                adContainer.remove();
            }
        }, 10000);
    }
}

// Spin Wheel مع نظام النسب المئوية
function spinWheel() {
    isSpinning = true;
    
    // نظام النسب المئوية للفوز
    // 0.01% للجائزة الكبرى 2000
    // 0.01% للجائزة 1000
    // 99.98% للباقي
    
    let random = Math.random() * 10000; // 0 to 10000
    
    let prizeIndex;
    
    if (random < 1) { // 0.01% للجائزة الكبرى 2000
        prizeIndex = 7; // 2000 points
        console.log('🎉 JACKPOT! 0.01% chance');
    } else if (random < 2) { // 0.01% للجائزة 1000
        prizeIndex = 6; // 1000 points
        console.log('🎉 Rare prize! 0.01% chance');
    } else {
        // باقي الجوائز (99.98%)
        let remainingPrizes = [0, 1, 2, 3, 4, 5]; // 10,20,50,100,200,500
        prizeIndex = remainingPrizes[Math.floor(Math.random() * remainingPrizes.length)];
    }
    
    let prize = prizes[prizeIndex];
    let prizeName = prizeNames[prizeIndex];
    
    userData.points += prize;
    userData.totalSpins++;
    
    if (userData.totalSpins % 5 === 0) {
        userData.level++;
    }
    
    let prizeRecord = {
        prize: prizeName,
        points: prize,
        date: new Date().toLocaleString()
    };
    userData.spinHistory.unshift(prizeRecord);
    
    updateUI();
    updateHistory();
    
    let targetAngle = (prizeIndex * (Math.PI * 2 / prizes.length)) + (Math.PI / prizes.length);
    animateWheel(targetAngle);
    
    setTimeout(() => {
        alert(`🎉 You won ${prizeName}!`);
        isSpinning = false;
    }, 2000);
}

// Animate Wheel
function animateWheel(finalAngle) {
    let startAngle = currentAngle;
    let startTime = null;
    let duration = 2000;
    let spins = 5;
    
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;
        
        if (progress < 1) {
            let totalAngle = startAngle + (finalAngle * progress * 10) + (spins * Math.PI * 2 * progress);
            currentAngle = totalAngle % (Math.PI * 2);
            drawWheelWithAngle(currentAngle);
            requestAnimationFrame(animate);
        } else {
            currentAngle = finalAngle;
            drawWheelWithAngle(finalAngle);
        }
    }
    
    requestAnimationFrame(animate);
}

// Draw Wheel with Angle
function drawWheelWithAngle(angle) {
    ctx.clearRect(0, 0, 350, 350);
    ctx.save();
    ctx.translate(175, 175);
    ctx.rotate(angle);
    ctx.translate(-175, -175);
    drawWheel();
    ctx.restore();
}

// Update History
function updateHistory() {
    let historyDiv = document.getElementById('prize-history');
    if (!historyDiv) return;
    
    historyDiv.innerHTML = '';
    
    if (userData.spinHistory.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No prizes yet</p>';
        return;
    }
    
    userData.spinHistory.slice(0, 10).forEach(record => {
        let item = document.createElement('div');
        item.className = 'prize-item';
        item.innerHTML = `
            <span>🏆 ${record.prize}</span>
            <span>${record.date}</span>
        `;
        historyDiv.appendChild(item);
    });
}

// Update Robux Equivalent
function updateRobuxEquivalent() {
    let robuxElement = document.getElementById('robux-equivalent');
    if (robuxElement) {
        let robux = Math.floor(userData.points / 100);
        robuxElement.textContent = robux;
    }
}

// Switch Tabs
function switchTab(tab, button) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    document.getElementById('wheel-tab').classList.remove('active');
    document.getElementById('transformation-tab').classList.remove('active');
    document.getElementById('coming-soon-tab').classList.remove('active');
    
    if (tab === 'wheel') {
        document.getElementById('wheel-tab').classList.add('active');
        document.getElementById('current-page-title').textContent = 'Lucky Wheel 🍀';
    } else if (tab === 'transformation') {
        document.getElementById('transformation-tab').classList.add('active');
        document.getElementById('current-page-title').textContent = 'Transformation 🪙';
    }
}

// Show Coming Soon
function showComingSoon() {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('wheel-tab').classList.remove('active');
    document.getElementById('transformation-tab').classList.remove('active');
    document.getElementById('coming-soon-tab').classList.add('active');
    document.getElementById('current-page-title').textContent = 'Coming Soon 🔜';
}

// Update Transactions
function updateTransactions() {
    let transactionDiv = document.getElementById('transaction-list');
    if (!transactionDiv) return;
    
    transactionDiv.innerHTML = '';
    
    if (userData.transactions.length === 0) {
        transactionDiv.innerHTML = '<p class="no-data">No transactions yet</p>';
        return;
    }
    
    userData.transactions.slice(0, 10).forEach(trans => {
        let item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <span>${trans.points} pts → ${trans.robux} Robux</span>
            <span>${trans.status}</span>
        `;
        transactionDiv.appendChild(item);
    });
}

// Update UI
function updateUI() {
    let elements = {
        'user-points': userData.points,
        'sidebar-points': userData.points,
        'top-points': userData.points,
        'transform-points': userData.points,
        'modal-points': userData.points
    };
    
    for (let [id, value] of Object.entries(elements)) {
        let element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    
    updateRobuxEquivalent();
}

// Show Withdraw Modal
function showWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'flex';
}

// Close Modal
function closeModal() {
    document.getElementById('withdraw-modal').style.display = 'none';
}

// Withdraw Points
function withdrawPoints() {
    let amount = parseInt(document.getElementById('withdraw-amount').value);
    let robloxUser = document.getElementById('roblox-user').value;
    
    if (!amount || amount < 700) {
        alert('Minimum withdrawal is 700 points (7 Robux)');
        return;
    }
    
    if (amount > userData.points) {
        alert('Insufficient points');
        return;
    }
    
    if (!robloxUser) {
        alert('Please enter your Roblox username');
        return;
    }
    
    let robuxAmount = Math.floor(amount / 100);
    
    alert(`✅ Withdrawal request sent! ${robuxAmount} Robux will be sent to ${robloxUser}`);
    
    userData.points -= amount;
    
    let transaction = {
        points: amount,
        robux: robuxAmount,
        username: robloxUser,
        date: new Date().toLocaleString(),
        status: 'Pending'
    };
    userData.transactions.unshift(transaction);
    
    updateUI();
    updateTransactions();
    closeModal();
    
    saveWithdrawRequest(amount, robuxAmount, robloxUser);
}

// Save Withdraw Request
function saveWithdrawRequest(points, robux, username) {
    let requests = JSON.parse(localStorage.getItem('withdrawRequests') || '[]');
    requests.push({
        points: points,
        robux: robux,
        username: username,
        robloxUser: userData.robloxUsername,
        userId: userData.userId,
        date: new Date().toISOString(),
        status: 'Pending'
    });
    localStorage.setItem('withdrawRequests', JSON.stringify(requests));
}

// Load User Data
function loadUserData() {
    let saved = localStorage.getItem('rbxWorldData');
    if (saved) {
        try {
            let loadedData = JSON.parse(saved);
            userData = {...userData, ...loadedData};
            updateUI();
            updateHistory();
            updateTransactions();
        } catch (e) {
            console.log('Using default data');
        }
    }
}

// Save User Data
function saveUserData() {
    localStorage.setItem('rbxWorldData', JSON.stringify(userData));
}

// Auto-save every minute
setInterval(saveUserData, 60000);