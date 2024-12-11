const playBtn = document.getElementById('playBtn');
const work = document.getElementById('work');
const anim = document.getElementById('anim');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const reloadBtn = document.getElementById('reloadBtn');
const closeBtn = document.getElementById('closeBtn');
const eventsTable = document.getElementById('eventsTable');
const eventsTableBody = document.getElementById('eventsTableBody');
let lastEventMessage = document.getElementById('lastEventMessage');

let circle1 = createCircle(25, 'red', 0, `${Math.random() * 300}px`);
let circle2 = createCircle(10, 'yellow', `${Math.random() * 700}px`, 0);
let animInterval;
let circlesMoving = false;
let eventsCount = 0;

let speed1X = 2;  
let speed1Y = 1;  
let speed2X = 1;  
let speed2Y = 2;  

 
playBtn.addEventListener('click', () => {
    localStorage.clear()
    eventsTableBody.innerHTML = '';
    eventsTable.style.display = 'none';
    work.style.display = 'block';
    playBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    reloadBtn.style.display = 'none';
    stopBtn.style.display = 'none';
});

closeBtn.addEventListener('click', () => {
    work.style.display = 'none';
    playBtn.style.display = 'inline-block';
    stopCircles();
    resetCircles();
    eventsTable.style.display = 'block';
    fetch('https://weblab7-backend-production.up.railway.app/get_events')
        .then(response => response.json())
        .then(serverEvents => {
            const localEvents = JSON.parse(localStorage.getItem('events')) || [];

             eventsTableBody.innerHTML = '';
            serverEvents.forEach((event, i) => {
                let row = document.createElement('tr');
                row.innerHTML = `<td>${event.event_number} : ${event.message} : ${event.time}</td>
                                 <td>${localEvents[i].eventsCount} : ${localEvents[i].message} : ${localEvents[i].time}</td>`;
                eventsTableBody.appendChild(row);
            });
        })
        .catch(console.error);
    lastEventMessage.textContent = '';
    eventsCount = 0;
});

 
startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    startCircles();
});

stopBtn.addEventListener('click', () => {
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    logEvent('Анімація зупинена', new Date().toLocaleTimeString());
    stopCircles();
});

reloadBtn.addEventListener('click', () => {
    resetCircles();
    reloadBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    logEvent('Анімація перезапущена', new Date().toLocaleTimeString());
});

function createCircle(radius, color, left, top) {
    let circle = document.createElement('div');
    circle.style.position = 'absolute';
    circle.style.width = circle.style.height = radius * 2 + 'px';
    circle.style.borderRadius = '50%';
    circle.style.backgroundColor = color;
    circle.style.left = left;
    circle.style.top = top;
    anim.appendChild(circle);
    return circle;
}

function startCircles() {
    circlesMoving = true;
    animInterval = setInterval(moveCircles, 0);
    logEvent('Анімація почалась', new Date().toLocaleTimeString());
}

function stopCircles() {
    circlesMoving = false;
    clearInterval(animInterval);
}

function resetCircles() {
    circle1.style.left = `${Math.random() * 700}px`;
    circle1.style.top = '0px';
    circle2.style.left = '0px';
    circle2.style.top = `${Math.random() * 250}px`;
    speed1X = 2;  
    speed1Y = 1;  
    speed2X = 1;  
    speed2Y = 2;
}

function moveCircles() {
     
    let circle1Left = parseInt(circle1.style.left) || 0;
    let circle1Top = parseInt(circle1.style.top) || 0;
    let circle2Left = parseInt(circle2.style.left) || 0;
    let circle2Top = parseInt(circle2.style.top) || 0;
    
    circle1Left += speed1X;
    circle1Top += speed1Y;
    circle2Left += speed2X;
    circle2Top += speed2Y;
    // logEvent(`Червоний круг перемістився на ${circle1Left+25}, ${circle1Top+25};
    // Жовтий круг перемістився на ${circle2Left+10}, ${circle2Top+10}`, new Date().toLocaleTimeString());

    if (circle1Left >= anim.clientWidth - circle1.offsetWidth || circle1Left <= 0) {
        speed1X = -speed1X;
        logEvent(`Червоний круг вдарився в межу на ${circle1Left+25}, ${circle1Top+25}`, new Date().toLocaleTimeString());
    }

    if (circle1Top >= anim.clientHeight - circle1.offsetHeight || circle1Top <= 0) {
        speed1Y = -speed1Y;
        logEvent(`Червоний круг вдарився в межу на ${circle1Left+25}, ${circle1Top+25}`, new Date().toLocaleTimeString());
    }

    if (circle2Left >= anim.clientWidth - circle2.offsetWidth || circle2Left <= 0) {
        speed2X = -speed2X;
        logEvent(`Жовтий круг вдарився в межу на ${circle1Left+10}, ${circle1Top+10}`, new Date().toLocaleTimeString());
    }
    if (circle2Top >= anim.clientHeight - circle2.offsetHeight || circle2Top <= 0) {
        speed2Y = -speed2Y;
        logEvent(`Жовтий круг вдарився в межу на ${circle1Left+10}, ${circle1Top+10}`, new Date().toLocaleTimeString());
    }

    circle1.style.left = circle1Left + 'px';
    circle1.style.top = circle1Top + 'px';
    circle2.style.left = circle2Left + 'px';
    circle2.style.top = circle2Top + 'px';

    let distX = Math.abs((circle1Left+25) - (circle2Left+10));
    let distY = Math.abs((circle1Top+25) - (circle2Top+10));

    let distanceBetweenCenters = Math.sqrt(distX * distX + distY * distY);

    if (distanceBetweenCenters <= 15) {
        stopCircles();   
        stopBtn.style.display = 'none';
        reloadBtn.style.display = 'inline-block';
        logEvent('Круги зупинились через накладання', new Date().toLocaleTimeString());
    }

}

function logEvent(message, time) {
    eventsCount++;
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events.push({eventsCount, time, message });
    localStorage.setItem('events', JSON.stringify(events));

    logEventToServer(eventsCount, message, time);

    lastEventMessage.textContent = `${eventsCount} : ${message} о ${time}`;
}

function logEventToServer(eventNumber, message, time) {
    fetch('https://weblab7-backend-production.up.railway.app/log_event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_number: eventNumber, message: message , time: time })
    }).catch(console.error);
}
