/** @type {CharData} */
let characterData       = [];
/** @type {CharData} */
let characterDataToSort = [];
/** @type {Options} */
let options             = [];

let currentVersion      = '';

let timestamp = 0;        
let timeTaken = 0;        
let choices   = '';       

let sortedIndexList = [];
let recordDataList  = [];
let parentIndexList = [];
let tiedDataList    = [];

let leftIndex       = 0;
let leftInnerIndex  = 0;
let rightIndex      = 0;
let rightInnerIndex = 0;
let battleNo        = 1;
let sortedNo        = 0;
let pointer         = 0;

let sortedIndexListPrev = [];
let recordDataListPrev  = [];
let parentIndexListPrev = [];
let tiedDataListPrev    = [];

let leftIndexPrev       = 0;
let leftInnerIndexPrev  = 0;
let rightIndexPrev      = 0;
let rightInnerIndexPrev = 0;
let battleNoPrev        = 1;
let sortedNoPrev        = 0;
let pointerPrev         = 0;

let finalCharacters = [];
let loading         = false;
let totalBattles    = 0;

function init() {
  document.querySelector('.starting.start.button').addEventListener('click', start);

  document.querySelector('.left.sort.image').addEventListener('click', () => pick('left'));
  document.querySelector('.right.sort.image').addEventListener('click', () => pick('right'));
  
  document.querySelector('.sorting.tie.button').addEventListener('click', () => pick('tie'));
  document.querySelector('.sorting.undo.button').addEventListener('click', undo);
  
  document.querySelector('.finished.getimg').addEventListener('click', generateImage);
  document.querySelector('.finished.list').addEventListener('click', generateTextList);
  document.querySelector('.finished.retry').addEventListener('click', () => location.reload());

  document.addEventListener('keydown', (ev) => {
    if (timestamp && !timeTaken && !loading && choices.length === battleNo - 1) {
      switch(ev.key.toLowerCase()) {
        case 'h': case 'arrowleft':  pick('left'); break;
        case 'l': case 'arrowright': pick('right'); break;
        case 'k': case 'arrowup':    pick('tie'); break;
        case 'j': case 'arrowdown':  undo(); break;
        default: break;
      }
    }
  });

  // Ban đầu chỉ hiển thị nút Bắt đầu
  document.querySelectorAll('.sorting.button').forEach(el => el.style.display = 'none');
  document.querySelector('.finished-container').style.display = 'none';
  document.querySelector('.starting.start.button').style.display = 'flex';

  setLatestDataset();
}

function start() {
  characterDataToSort = characterData.slice(0);

  if (characterDataToSort.length < 2) {
    alert('Không đủ bài hát để xếp hạng!');
    return;
  }

  timestamp = timestamp || new Date().getTime();
  Math.seedrandom(timestamp);

  characterDataToSort = characterDataToSort
    .map(a => [Math.random(), a])
    .sort((a,b) => a[0] - b[0])
    .map(a => a[1]);

  recordDataList  = characterDataToSort.map(() => 0);
  tiedDataList    = characterDataToSort.map(() => -1);

  sortedIndexList[0] = characterDataToSort.map((val, idx) => idx);
  parentIndexList[0] = -1;

  let midpoint = 0;   
  let marker   = 1;   

  for (let i = 0; i < sortedIndexList.length; i++) {
    if (sortedIndexList[i].length > 1) {
      let parent = sortedIndexList[i];
      midpoint = Math.ceil(parent.length / 2);

      sortedIndexList[marker] = parent.slice(0, midpoint);              
      totalBattles += sortedIndexList[marker].length;                   
      parentIndexList[marker] = i;                                      
      marker++;                                                         

      sortedIndexList[marker] = parent.slice(midpoint, parent.length);  
      totalBattles += sortedIndexList[marker].length;                   
      parentIndexList[marker] = i;                                      
      marker++;                                                         
    }
  }

  leftIndex   = sortedIndexList.length - 2;    
  rightIndex  = sortedIndexList.length - 1;    

  leftInnerIndex  = 0;                        
  rightInnerIndex = 0;                        

  document.querySelectorAll('.starting.button').forEach(el => el.style.display = 'none');
  document.querySelector('.loading.button').style.display = 'none';
  
  document.querySelector('.progress').classList.add('active');
  loading = true;

  preloadImages().then(() => {
    loading = false;
    document.querySelector('.loading.button').style.display = 'none';
    
    document.querySelectorAll('.sorting.button').forEach(el => el.style.display = 'flex');
    document.querySelectorAll('.sort.text').forEach(el => el.style.display = 'block');
    display();
  });
}

function display() {
  const percent         = Math.floor(sortedNo * 100 / totalBattles);
  const leftCharIndex   = sortedIndexList[leftIndex][leftInnerIndex];
  const rightCharIndex  = sortedIndexList[rightIndex][rightInnerIndex];
  const leftChar        = characterDataToSort[leftCharIndex];
  const rightChar       = characterDataToSort[rightCharIndex];

  const charNameDisp = name => `<p>${name}</p>`;

  progressBar(`Battle No. ${battleNo}`, percent);

  document.querySelector('.left.sort.image').src = leftChar.img;
  document.querySelector('.right.sort.image').src = rightChar.img;

  document.querySelector('.left.sort.text').innerHTML = charNameDisp(leftChar.name);
  document.querySelector('.right.sort.text').innerHTML = charNameDisp(rightChar.name);

  if (choices.length !== battleNo - 1) {
    switch (Number(choices[battleNo - 1])) {
      case 0: pick('left'); break;
      case 1: pick('right'); break;
      case 2: pick('tie'); break;
      default: break;
    }
  }
}

function pick(sortType) {
  if ((timeTaken && choices.length === battleNo - 1) || loading) { return; }
  else if (!timestamp) { return; }

  sortedIndexListPrev = sortedIndexList.slice(0);
  recordDataListPrev  = recordDataList.slice(0);
  parentIndexListPrev = parentIndexList.slice(0);
  tiedDataListPrev    = tiedDataList.slice(0);

  leftIndexPrev       = leftIndex;
  leftInnerIndexPrev  = leftInnerIndex;
  rightIndexPrev      = rightIndex;
  rightInnerIndexPrev = rightInnerIndex;
  battleNoPrev        = battleNo;
  sortedNoPrev        = sortedNo;
  pointerPrev         = pointer;

  switch (sortType) {
    case 'left': {
      if (choices.length === battleNo - 1) { choices += '0'; }
      recordData('left');
      while (tiedDataList[recordDataList[pointer - 1]] != -1) {
        recordData('left');
      }
      break;
    }
    case 'right': {
      if (choices.length === battleNo - 1) { choices += '1'; }
      recordData('right');
      while (tiedDataList[recordDataList[pointer - 1]] != -1) {
        recordData('right');
      }
      break;
    }
    case 'tie': {
      if (choices.length === battleNo - 1) { choices += '2'; }
      recordData('left');
      while (tiedDataList[recordDataList[pointer - 1]] != -1) {
        recordData('left');
      }
      tiedDataList[recordDataList[pointer - 1]] = sortedIndexList[rightIndex][rightInnerIndex];
      recordData('right');
      while (tiedDataList[recordDataList[pointer - 1]] != -1) {
        recordData('right');
      }
      break;
    }
    default: return;
  }

  const leftListLen = sortedIndexList[leftIndex].length;
  const rightListLen = sortedIndexList[rightIndex].length;

  if (leftInnerIndex < leftListLen && rightInnerIndex === rightListLen) {
    while (leftInnerIndex < leftListLen) {
      recordData('left');
    }
  } else if (leftInnerIndex === leftListLen && rightInnerIndex < rightListLen) {
    while (rightInnerIndex < rightListLen) {
      recordData('right');
    }
  }

  if (leftInnerIndex === leftListLen && rightInnerIndex === rightListLen) {
    for (let i = 0; i < leftListLen + rightListLen; i++) {
      sortedIndexList[parentIndexList[leftIndex]][i] = recordDataList[i];
    }
    sortedIndexList.pop();
    sortedIndexList.pop();
    leftIndex = leftIndex - 2;
    rightIndex = rightIndex - 2;
    leftInnerIndex = 0;
    rightInnerIndex = 0;

    sortedIndexList.forEach((val, idx) => recordDataList[idx] = 0);
    pointer = 0;
  }

  if (leftIndex < 0) {
    timeTaken = timeTaken || new Date().getTime() - timestamp;
    progressBar(`Battle No. ${battleNo} - Hoàn thành!`, 100);
    result();
  } else {
    battleNo++;
    display();
  }
}

function recordData(sortType) {
  if (sortType === 'left') {
    recordDataList[pointer] = sortedIndexList[leftIndex][leftInnerIndex];
    leftInnerIndex++;
  } else {
    recordDataList[pointer] = sortedIndexList[rightIndex][rightInnerIndex];
    rightInnerIndex++;
  }
  
  pointer++;
  sortedNo++;
}

function progressBar(indicator, percentage) {
  const battleElem = document.querySelector('.progressbattle');
  if (battleElem) battleElem.innerHTML = indicator;
  document.querySelector('.progressfill').style.width = `${percentage}%`;
  document.querySelector('.progresstext').innerHTML = `${percentage}%`;
}

function result() {
  document.querySelector('.progress').classList.remove('active');
  document.querySelectorAll('.sorting.button').forEach(el => el.style.display = 'none');
  document.querySelector('.finished-container').style.display = 'flex';
  
  document.querySelector('.time.taken').style.display = 'block';
  document.querySelectorAll('.sort.text').forEach(el => el.innerHTML = '');

  document.querySelector('.left.sort.image').src = 'src/assets/defaultL.jpg';
  document.querySelector('.right.sort.image').src = 'src/assets/defaultR.jpg';

  const timeStr = `Thời gian thực hiện: ${msToReadableTime(timeTaken)}.`;

  let rankNum     = 1;
  let tiedRankNum = 1;

  const finalSortedIndexes = sortedIndexList[0].slice(0);
  const resultTable = document.querySelector('.results');
  const timeElem = document.querySelector('.time.taken');

  resultTable.innerHTML = ''; 
  timeElem.innerHTML = timeStr;

  const topContainer = document.createElement('div');
  topContainer.className = 'top5-container';

  const subContainer = document.createElement('div');
  subContainer.className = 'sub-results-container';

  finalCharacters = [];

  characterDataToSort.forEach((val, idx) => {
    const characterIndex = finalSortedIndexes[idx];
    const character = characterDataToSort[characterIndex];
    
    if (idx < 5) {
      const topHtml = `
        <div class="top-card">
          <div class="top-badge">#${rankNum}</div>
          <div class="top-img-wrap">
            <img src="${character.img}" alt="${character.name}">
          </div>
          <div class="top-name">${character.name}</div>
        </div>
      `;
      topContainer.insertAdjacentHTML('beforeend', topHtml);
    } 
    else {
      const subHtml = `
        <div class="sub-item">
          <span class="sub-badge">${rankNum}</span>
          <span class="sub-name" title="${character.name}">${character.name}</span>
        </div>
      `;
      subContainer.insertAdjacentHTML('beforeend', subHtml);
    }

    finalCharacters.push({ rank: rankNum, name: character.name });

    if (idx < characterDataToSort.length - 1) {
      if (tiedDataList[characterIndex] === finalSortedIndexes[idx + 1]) {
        tiedRankNum++;            
      } else {
        rankNum += tiedRankNum;   
        tiedRankNum = 1;          
      }
    }
  });

  resultTable.appendChild(topContainer);
  resultTable.appendChild(subContainer);
}

function undo() {
  if (timeTaken) { return; }

  choices = battleNo === battleNoPrev ? choices : choices.slice(0, -1);

  sortedIndexList = sortedIndexListPrev.slice(0);
  recordDataList  = recordDataListPrev.slice(0);
  parentIndexList = parentIndexListPrev.slice(0);
  tiedDataList    = tiedDataListPrev.slice(0);

  leftIndex       = leftIndexPrev;
  leftInnerIndex  = leftInnerIndexPrev;
  rightIndex      = rightIndexPrev;
  rightInnerIndex = rightInnerIndexPrev;
  battleNo        = battleNoPrev;
  sortedNo        = sortedNoPrev;
  pointer         = pointerPrev;

  display();
}

/* Kỹ thuật chụp ảnh loại bỏ màu nền trắng & đè mép */
function generateImage() {
  const timeFinished = timestamp + timeTaken;
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const filename = 'sort-' + (new Date(timeFinished - tzoffset)).toISOString().slice(0, -5).replace('T', '(') + ').png';

  const targetElem = document.querySelector('#results-container');

  html2canvas(targetElem, {
    backgroundColor: '#11265b', // Ép màu nền chuẩn xanh đậm
    useCORS: true,
    scale: 2 // Tăng độ phân giải sắc nét
  }).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const imgBtn = document.querySelector('.finished.getimg');
    imgBtn.innerHTML = `<a href="${dataURL}" download="${filename}" style="color:#fff;text-decoration:none;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">Tải ảnh về</a>`;
  });
}

function generateTextList() {
  const data = finalCharacters.reduce((str, char) => {
    str += `${char.rank}. ${char.name}<br>`;
    return str;
  }, '');
  const oWindow = window.open("", "", "height=640,width=480");
  oWindow.document.write(data);
}

function setLatestDataset() {
  timestamp = 0;
  timeTaken = 0;
  choices   = '';

  const latestDateIndex = Object.keys(dataSet)
    .map(date => new Date(date))
    .reduce((latestDateIndex, currentDate, currentIndex, array) => {
      return currentDate > array[latestDateIndex] ? currentIndex : latestDateIndex;
    }, 0);
  currentVersion = Object.keys(dataSet)[latestDateIndex];

  characterData = dataSet[currentVersion].characterData;
  options = dataSet[currentVersion].options;
}

function preloadImages() {
  const totalLength = characterDataToSort.length;
  let imagesLoaded = 0;

  const loadImage = async (src) => {
    const blob = await fetch(src).then(res => res.blob());
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = ev => {
        progressBar(`Loading Image ${++imagesLoaded}`, Math.floor(imagesLoaded * 100 / totalLength));
        res(ev.target.result);
      };
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
  };

  return Promise.all(characterDataToSort.map(async (char, idx) => {
    characterDataToSort[idx].img = await loadImage(imageRoot + char.img);
  }));
}

function msToReadableTime (milliseconds) {
  let t = Math.floor(milliseconds/1000);
  const minutes = Math.floor(t / 60);
  t = t - (minutes * 60);
  const content = [];
  if (minutes) content.push(minutes + " phút");
  if (t) content.push(t + " giây");
  return content.join(' ');
}

window.onload = init;
