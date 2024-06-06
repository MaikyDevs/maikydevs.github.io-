
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slot Maschine</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #282c34;
            color: white;
            margin: 0;
            flex-direction: column;
            position: relative;
        }
        .slot-machine {
            text-align: center;
        }
        .reels {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
        .reel {
            width: 50px;
            height: 50px;
            border: 2px solid #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 5px;
            font-size: 2em;
            background-color: #333;
            overflow: hidden;
            position: relative;
        }
        .reel div {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        button {
            padding: 10px 20px;
            font-size: 1em;
            cursor: pointer;
            background-color: #61dafb;
            border: none;
            border-radius: 5px;
            color: #282c34;
            margin: 5px;
        }
        .balance {
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .message {
            font-size: 1.2em;
            margin-top: 10px;
            color: yellow;
        }
        .debug-tools {
            display: none;
            flex-direction: column;
            margin-top: 20px;
        }
        .debug-tools input,
        .debug-tools button {
            padding: 5px;
            margin: 5px 0;
        }
        .debug-tools button {
            background-color: #ff4b5c;
        }
        .ad-container {
            position: absolute;
            top: 10px;
            right: 10px;
            resize: both;
            overflow: hidden;
        }
        .ad-container img, .ad-container video {
            max-width: 100%;
            max-height: 100%;
        }
    </style>
</head>
<body>
    <div class="slot-machine">
        <div class="balance">Guthaben: <span id="balance">0</span> €</div>
        <div class="reels">
            <div class="reel" id="reel1"><div>7</div></div>
            <div class="reel" id="reel2"><div>7</div></div>
            <div class="reel" id="reel3"><div>7</div></div>
        </div>
        <button onclick="spin()">Drehen</button>
        <button onclick="toggleMode()" id="modeButton">Kostenlose Version</button>
        <div class="message" id="message"></div>
    </div>
    <div class="debug-tools" id="debugTools">
        <input type="number" id="setBalance" placeholder="Setze Guthaben">
        <button onclick="setBalance()">Guthaben festlegen</button>
        <input type="number" id="setWinAfterRounds" placeholder="Gewinn nach Runden">
        <button onclick="setWinAfterRounds()">Gewinn nach Runden festlegen</button>
        <button onclick="resetBalance()">Guthaben zurücksetzen</button>
        <button onclick="clearData()">Daten löschen</button>
        <input type="file" id="adImage" accept="image/*,video/*">
        <input type="number" id="adWidth" placeholder="Werbung Breite (px)">
        <input type="number" id="adHeight" placeholder="Werbung Höhe (px)">
        <button onclick="uploadAd()">Werbung hochladen</button>
    </div>
    <div class="ad-container" id="adContainer" style="width: 200px; height: 200px;"></div>
    <script>
        let costPerSpin = 0;
        let isSpinning = false;
        let debugMode = false;
        let winAfterRounds = 0;
        let currentRound = 0;

        function getRandomNumber() {
            return Math.floor(Math.random() * 10);
        }

        function loadBalance() {
            const balance = localStorage.getItem('balance');
            return balance ? parseInt(balance, 10) : 0;
        }

        function saveBalance(balance) {
            localStorage.setItem('balance', balance);
        }

        function updateBalanceDisplay(balance) {
            document.getElementById('balance').innerText = balance;
        }

        function showMessage(message) {
            const messageDiv = document.getElementById('message');
            messageDiv.innerText = message;
            messageDiv.style.display = 'block';
        }

        function clearMessage() {
            const messageDiv = document.getElementById('message');
            messageDiv.style.display = 'none';
        }

        function toggleMode() {
            const modeButton = document.getElementById('modeButton');
            if (costPerSpin === 0) {
                costPerSpin = 10;
                modeButton.innerText = 'Kostenpflichtige Version (10 € pro Spin)';
            } else {
                costPerSpin = 0;
                modeButton.innerText = 'Kostenlose Version';
            }
        }

        function spin() {
            if (isSpinning) return;

            clearMessage();
            isSpinning = true;
            currentRound++;

            let balance = loadBalance();

            if (costPerSpin > 0 && balance < costPerSpin) {
                showMessage('Nicht genug Guthaben!');
                isSpinning = false;
                return;
            }

            if (costPerSpin > 0) {
                balance -= costPerSpin;
                saveBalance(balance);
                updateBalanceDisplay(balance);
            }

            animateReels();

            setTimeout(() => {
                const reel1 = getRandomNumber();
                const reel2 = getRandomNumber();
                const reel3 = getRandomNumber();
                document.getElementById('reel1').innerHTML = `<div>${reel1}</div>`;
                document.getElementById('reel2').innerHTML = `<div>${reel2}</div>`;
                document.getElementById('reel3').innerHTML = `<div>${reel3}</div>`;

                let message = '';

                if (currentRound === winAfterRounds) {
                    currentRound = 0;
                    balance += 600000;
                    message = 'Jackpot! Du hast 600.000 € gewonnen!';
                } else if (reel1 === reel2 && reel2 === reel3) {
                    balance += 600000;
                    message = 'Jackpot! Du hast 600.000 € gewonnen!';
                } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
                    balance += 2;
                    message = 'Du hast 2 € gewonnen!';
                }

                if (message) {
                    showMessage(message);
                }

                saveBalance(balance);
                updateBalanceDisplay(balance);

                isSpinning = false;
            }, 2000); // 2 Sekunden Verzögerung
        }

        function animateReels() {
            const reels = document.querySelectorAll('.reel div');
            reels.forEach(reel => {
                reel.style.animation = 'spin 0.1s linear infinite';
                let interval = setInterval(() => {
                    reel.innerText = getRandomNumber();
                }, 100);
                setTimeout(() => {
                    clearInterval(interval);
                    reel.style.animation = 'none';
                }, 2000); // Stop animation after 2 seconds
            });
        }

        function enableDebugMode() {
            const debugTools = document.getElementById('debugTools');
            if (debugMode) {
                debugTools.style.display = 'none';
                debugMode = false;
            } else {
                debugTools.style.display = 'flex';
                debugMode = true;
            }
        }

        function setBalance() {
            const balanceInput = document.getElementById('setBalance');
            const balance = parseInt(balanceInput.value, 10);
            saveBalance(balance);
            updateBalanceDisplay(balance);
        }

        function setWinAfterRounds() {
            const roundsInput = document.getElementById('setWinAfterRounds');
            winAfterRounds = parseInt(roundsInput.value, 10);
        }

        function resetBalance() {
            saveBalance(0);
            updateBalanceDisplay(0);
        }

        function clearData() {
            localStorage.removeItem('balance');
            updateBalanceDisplay(0);
        }

        function uploadAd() {
            const adInput = document.getElementById('adImage');
            const file = adInput.files[0];
            const adWidth = document.getElementById('adWidth').value;
            const adHeight = document.getElementById('adHeight').value;
            const reader = new FileReader();
            reader.onload = function (e) {
                const adContainer = document.getElementById('adContainer');
                adContainer.innerHTML = '';
                const adElement = file.type.startsWith('video/') ? document.createElement('video') : document.createElement('img');
                adElement.src = e.target.result;
                adElement.style.width = adWidth ? `${adWidth}px` : 'auto';
                adElement.style.height = adHeight ? `${adHeight}px` : 'auto';
                if (file.type.startsWith('video/')) {
                    adElement.autoplay = true;
                    adElement.loop = true;
                }
                adContainer.appendChild(adElement);
            };
            if (file) {
                reader.readAsDataURL(file);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            updateBalanceDisplay(loadBalance());

            const adContainer = document.getElementById('adContainer');
            adContainer.addEventListener('mousedown', function (e) {
                if (!debugMode) return;
                let startX = e.clientX;
                let startY = e.clientY;
                let startWidth = parseInt(document.defaultView.getComputedStyle(adContainer).width, 10);
                let startHeight = parseInt(document.defaultView.getComputedStyle(adContainer).height, 10);
                
                function doDrag(e) {
                    adContainer.style.width = (startWidth + e.clientX - startX) + 'px';
                    adContainer.style.height = (startHeight + e.clientY - startY) + 'px';
                }

                function stopDrag() {
                    document.documentElement.removeEventListener('mousemove', doDrag, false);
                    document.documentElement.removeEventListener('mouseup', stopDrag, false);
                }

                document.documentElement.addEventListener('mousemove', doDrag, false);
                document.documentElement.addEventListener('mouseup', stopDrag, false);
            }, false);
        });

        // Press 'D' to toggle debug mode
        document.addEventListener('keydown', function (e) {
            if (e.key === 'd' || e.key === 'D') {
                enableDebugMode();
            }
        });

        function playNeverGonnaGiveYouUp() {
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
}





    </script>
    <button onclick="playNeverGonnaGiveYouUp()">Todesstern</button>

</body>
</html>
