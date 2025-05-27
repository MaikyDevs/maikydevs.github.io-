/*----- constants -----*/
var bombImage = '<img src="images/bomb.png">';
var flagImage = '<img src="images/flag.png">';
var wrongBombImage = '<img src="images/wrong-bomb.png">'
var sizeLookup = {
  '9': {totalBombs: 10, tableWidth: '245px'},
  '16': {totalBombs: 40, tableWidth: '420px'},
  '30': {totalBombs: 160, tableWidth: '794px'}
};
var colors = [
  '',
  '#0000FA',
  '#4B802D',
  '#DB1300',
  '#202081',
  '#690400',
  '#457A7A',
  '#1B1B1B',
  '#7A7A7A',
];

/*----- app's state (variables) -----*/
var size = 16;
var board;
var bombCount;
var timeElapsed;
var adjBombs;
var hitBomb;
var elapsedTime;
var timerId;
var winner;
var cheatActive = false;

/*----- cached element references -----*/
var boardEl = document.getElementById('board');

/*----- event listeners -----*/
document.addEventListener('keydown', function(e) {
  if (e.shiftKey && e.key.toLowerCase() === 'o') {
    cheatActive = !cheatActive;
    board.forEach(function(rowArr) {
      rowArr.forEach(function(cell) {
        if (cell.bomb) {
          var el = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
          el.style.backgroundColor = cheatActive ? '#ffcccb' : '#C0C0C0';
        }
      });
    });
  }
});

document.getElementById('size-btns').addEventListener('click', function(e) {
  size = parseInt(e.target.id.replace('size-', ''));
  init();
  render();
});

boardEl.addEventListener('click', function(e) {
  if (winner || hitBomb) return;
  var clickedEl;
  clickedEl = e.target.tagName.toLowerCase() === 'img' ? e.target.parentElement : e.target;
  if (clickedEl.classList.contains('game-cell')) {
    if (!timerId) setTimer();
    var row = parseInt(clickedEl.dataset.row);
    var col = parseInt(clickedEl.dataset.col);
    var cell = board[row][col];
    if (e.shiftKey && !cell.revealed && bombCount > 0) {
      bombCount += cell.flag() ? -1 : 1;
    } else {
      hitBomb = cell.reveal();
      if (hitBomb) {
        revealAll();
        clearInterval(timerId);
        e.target.style.backgroundColor = 'red';
      }
    }
    winner = getWinner();
    render();
  }
});

function createResetListener() { 
  document.getElementById('reset').addEventListener('click', function() {
    init();
    render();
  });
}

/*----- functions -----*/
function setTimer () {
  timerId = setInterval(function(){
    elapsedTime += 1;
    document.getElementById('timer').innerText = elapsedTime.toString().padStart(3, '0');
  }, 1000);
};

function revealAll() {
  board.forEach(function(rowArr) {
    rowArr.forEach(function(cell) {
      cell.reveal();
    });
  });
};

function buildTable() {
    var topRow = `
    <tr>
        <td class="menu" id="window-title-bar" colspan="${size}">
            <div id="window-title"><img src="images/mine-menu-icon.png"> Minesweeper</div>
            <div id="window-controls"><img src="images/window-controls.png"></div>
        </td>
    <tr>
        <td class="menu" id="folder-bar" colspan="${size}">
            <div id="folder1"><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="blank">Read Me </a></div>
        </td>
    </tr>
    </tr>
        <tr>
            <td class="menu" colspan="${size}">
                <section id="status-bar">
                    <div id="bomb-counter">000</div>
                    <div id="reset"><img src="images/smiley-face.png"></div>
                    <div id="timer">000</div>
                </section>
            </td>
        </tr>
        `;
    boardEl.innerHTML = topRow + `<tr>${'<td class="game-cell"></td>'.repeat(size)}</tr>`.repeat(size);
    boardEl.style.width = sizeLookup[size].tableWidth;
    createResetListener();
    var cells = Array.from(document.querySelectorAll('td:not(.menu)'));
    cells.forEach(function(cell, idx) {
        cell.setAttribute('data-row', Math.floor(idx / size));
        cell.setAttribute('data-col', idx % size);
    });
}

async function showLeaderboard() {
    try {
        const { data: scores, error } = await window.supabase
            .from('leaderboard')
            .select('*')
            .eq('board_size', size)
            .order('time', { ascending: true })
            .limit(10);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return;
        }

        const leaderboardList = document.querySelector('.leaderboard ul');
        if (!leaderboardList) {
            console.error('Leaderboard element not found');
            return;
        }
        
        // Nur leeren wenn wir auch neue Daten haben
        if (scores && Array.isArray(scores)) {
            leaderboardList.innerHTML = '';
            
            if (scores.length > 0) {
                scores.forEach((score, index) => {
                    const li = document.createElement('li');
                    li.textContent = `${index + 1}. ${score.player_name}: ${score.time}s`;
                    leaderboardList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No scores yet!';
                leaderboardList.appendChild(li);
            }
        }
    } catch (err) {
        console.error('Error in showLeaderboard:', err);
    }
}

function buildArrays() {
  var arr = Array(size).fill(null);
  arr = arr.map(function() {
    return new Array(size).fill(null);
  });
  return arr;
};

function buildCells(){
  board.forEach(function(rowArr, rowIdx) {
    rowArr.forEach(function(slot, colIdx) {
      board[rowIdx][colIdx] = new Cell(rowIdx, colIdx, board);
    });
  });
  addBombs();
  runCodeForAllCells(function(cell){
    cell.calcAdjBombs();
  });
};

function init() {
  buildTable();
  board = buildArrays();
  buildCells();
  bombCount = getBombCount();
  elapsedTime = 0;
  clearInterval(timerId);
  timerId = null;
  hitBomb = false;
  winner = false;
  showLeaderboard();  // Refresh leaderboard when game initializes
}

// Also update the size button event listener to refresh leaderboard
document.getElementById('size-btns').addEventListener('click', async function(e) {
    size = parseInt(e.target.id.replace('size-', ''));
    init();
    render();
    await showLeaderboard();  // Refresh leaderboard when size changes
});

function getBombCount() {
  var count = 0;
  board.forEach(function(row){
    count += row.filter(function(cell) {
      return cell.bomb;
    }).length
  });
  return count;
};

function addBombs() {
  var currentTotalBombs = sizeLookup[`${size}`].totalBombs;
  while (currentTotalBombs !== 0) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    var currentCell = board[row][col]
    if (!currentCell.bomb){
      currentCell.bomb = true
      currentTotalBombs -= 1
    }
  }
};

async function saveScore(time) {
    try {
        console.log('Versuche Score zu speichern...');
        const playerName = prompt('You won! Enter your name for the leaderboard:');
        if (!playerName) {
            console.log('Kein Name eingegeben, breche ab');
            return;
        }

        console.log('Speichere Score für:', playerName, 'Zeit:', time);
        
        // Überprüfe ob Supabase verfügbar ist
        if (!window.supabase) {
            console.error('Supabase ist nicht initialisiert!');
            return;
        }

        const scoreData = {
            player_name: playerName,
            time: time,
            board_size: size
        };
        console.log('Score-Daten:', scoreData);

        // Score in der Datenbank speichern
        const { data, error: insertError } = await window.supabase
            .from('leaderboard')
            .insert([scoreData])
            .select();

        console.log('Datenbank-Antwort:', { data, error: insertError });

        if (insertError) {
            console.error('Error saving score:', insertError);
            return;
        }

        console.log('Score erfolgreich gespeichert, hole aktualisierte Scores...');

        // Hole die aktualisierten Scores
        const { data: scores, error: fetchError } = await window.supabase
            .from('leaderboard')
            .select('*')
            .eq('board_size', size)
            .order('time', { ascending: true })
            .limit(10);

        if (fetchError) {
            console.error('Error fetching updated scores:', fetchError);
            return;
        }

        console.log('Aktuelle Scores:', scores);

        const leaderboardList = document.querySelector('.leaderboard ul');
        if (!leaderboardList) {
            console.error('Leaderboard Element nicht gefunden!');
            return;
        }

        leaderboardList.innerHTML = '';
        
        if (scores && scores.length > 0) {
            scores.forEach((score, index) => {
                const li = document.createElement('li');
                li.textContent = `${index + 1}. ${score.player_name}: ${score.time}s`;
                if (score.player_name === playerName && score.time === time) {
                    li.style.backgroundColor = '#e6ffe6';
                }
                leaderboardList.appendChild(li);
            });
            console.log('Leaderboard aktualisiert');
        } else {
            console.log('Keine Scores gefunden');
            const li = document.createElement('li');
            li.textContent = 'No scores yet!';
            leaderboardList.appendChild(li);
        }
    } catch (err) {
        console.error('Fehler in saveScore:', err);
    }
}

// Füge eine Test-Funktion hinzu
async function testDatabaseConnection() {
    try {
        console.log('Teste Datenbankverbindung...');
        const { data, error } = await window.supabase
            .from('leaderboard')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Datenbankverbindung fehlgeschlagen:', error);
            return false;
        }
        
        console.log('Datenbankverbindung erfolgreich:', data);
        return true;
    } catch (err) {
        console.error('Fehler beim Testen der Datenbankverbindung:', err);
        return false;
    }
}

// Teste die Verbindung beim Start
window.addEventListener('load', async () => {
    console.log('Supabase Client:', window.supabase);
    const isConnected = await testDatabaseConnection();
    console.log('Datenbank verbunden:', isConnected);
});

// Modify the existing win check to include saving score
function getWinner() {
    for (var row = 0; row<board.length; row++) {
        for (var col = 0; col<board[0].length; col++) {
            var cell = board[row][col];
            if (!cell.revealed && !cell.bomb) return false;
        }
    }
    if (!hitBomb) {
        saveScore(elapsedTime);
    }
    return true;
}

function render() {
  document.getElementById('bomb-counter').innerText = bombCount.toString().padStart(3, '0');
  var seconds = timeElapsed % 60;
  var tdList = Array.from(document.querySelectorAll('[data-row]'));
  tdList.forEach(function(td) {
    var rowIdx = parseInt(td.getAttribute('data-row'));
    var colIdx = parseInt(td.getAttribute('data-col'));
    var cell = board[rowIdx][colIdx];
    if (cell.flagged) {
      td.innerHTML = flagImage;
    } else if (cell.revealed) {
      if (cell.bomb) {
        td.innerHTML = bombImage;
      } else if (cell.adjBombs) {
        td.className = 'revealed'
        td.style.color = colors[cell.adjBombs];
        td.textContent = cell.adjBombs;
      } else {
        td.className = 'revealed'
      }
    } else {
      td.innerHTML = '';
    }
  });
  if (hitBomb) {
    document.getElementById('reset').innerHTML = '<img src=images/dead-face.png>';
    runCodeForAllCells(function(cell) {
      if (!cell.bomb && cell.flagged) {
        var td = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
        td.innerHTML = wrongBombImage;
      }
    });
  } else if (winner) {
    document.getElementById('reset').innerHTML = '<img src=images/cool-face.png>';
    clearInterval(timerId);
  }
};

function runCodeForAllCells(cb) {
  board.forEach(function(rowArr) {
    rowArr.forEach(function(cell) {
      cb(cell);
    });
  });
}

init();
render();