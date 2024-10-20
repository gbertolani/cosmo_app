import { zoom, resetView, centerMap, toggleGrid } from './2Dmap.js'


const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const centerMapBtn = document.getElementById('centerMapBtn');
const toggleGridBtn = document.getElementById('toggleGridBtn');
const configGridBtn = document.getElementById('configBtn');
const joystickBtn = document.getElementById('joystickBtn');


const backJoyBtn = document.getElementById('backJoyBtn');
const configJoyBtn = document.getElementById('configJoyBtn');
const centerJoyBtn = document.getElementById('centerJoyBtn');
const cubeJoyBtn = document.getElementById('cubeJoyBtn');


document.addEventListener('DOMContentLoaded', () => {
    // Auto open config
    const storageValues = localStorage.getItem('cosmoSettings');
    if(storageValues == null){
        openSettings();
    }
});

async function openSettings(){
    let currentValues = localStorage.getItem('cosmoSettings');
    currentValues = currentValues != null ? JSON.parse(currentValues) : {};
    const result = await Swal.fire({
        title: 'Configuration',
        html: `
            <input type="text" id="socketHost" class="swal2-input" placeholder="WebSocket Host"
                value=${currentValues.host || 'ws://localhost:9090/'}>
        `,
        // focusConfirm: false,
        // heightAuto: false,
        preConfirm: () => {
            const host = document.getElementById('socketHost').value;
            if (!host) {
                Swal.showValidationMessage('Host is Requiered');
            }
            return { host };
        }
    })
    if(result.isConfirmed){
        localStorage.setItem('cosmoSettings', JSON.stringify(result.value));
        Swal.fire({
          title: "Saved!",
          text: "Config has been saved.",
          icon: "success"
        });
    }
}

function openJoystick() {
    const buttons = document.querySelector('.controls');
    buttons.style.display = 'none'

    const joyContainer = document.querySelector('.joystick-container-mobile');
    joyContainer.style.display = 'flex'
    var joy = new JoyStick('joyDivMobile', {
        title: 'joystickMobile',
        internalFillColor: '#4cc9f0',
        internalStrokeColor: '#1f4068',
        externalStrokeColor: '#1f4068',
        autoReturnToCenter: true,
    });

}

function open3DMap() {

}

function goBackMobile() {
    const buttons = document.querySelector('.controls');
    buttons.style.display = 'flex'

    const joyContainer = document.querySelector('.joystick-container-mobile');
    joyContainer.style.display = 'none'

    const joystick = document.getElementById('joyDivMobile')
    joystick.innerHTML = ''

}

zoomInBtn.addEventListener('click', () => zoom('in'));
zoomOutBtn.addEventListener('click', () => zoom('out'));
resetViewBtn.addEventListener('click', resetView);
centerMapBtn.addEventListener('click', centerMap);
toggleGridBtn.addEventListener('click', toggleGrid);
configGridBtn.addEventListener('click', openSettings);
joystickBtn.addEventListener('click', openJoystick);

backJoyBtn.addEventListener('click', goBackMobile);
configJoyBtn.addEventListener('click', openSettings);
centerJoyBtn.addEventListener('click', centerMap);
cubeJoyBtn.addEventListener('click', open3DMap);


