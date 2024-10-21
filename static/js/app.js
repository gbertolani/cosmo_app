import { zoom, resetView, centerMap, toggleGrid } from './2Dmap.js'
import { settingCfg, openSettings } from './settings.js'
import { ros } from './ros2.js'



const motorCommandTopic = new ROSLIB.Topic({
    ros: ros,
    name: '/motor_command',  // Cambia este nombre según tu tópico
    messageType: 'serial_motor_demo_msgs/msg/MotorCommand'  // Tipo de mensaje esperado
});


function publishMotorMessage(left_pwm, right_pwm){
    const command = new ROSLIB.Message({
        is_pwm: true,
        mot_1_req_rad_sec: left_pwm,
        mot_2_req_rad_sec: right_pwm,
    });
    motorCommandTopic.publish(command);
}


const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetViewBtn = document.getElementById('resetViewBtn');
const centerMapBtn = document.getElementById('centerMapBtn');
const toggleGridBtn = document.getElementById('toggleGridBtn');
const configGridBtn = document.getElementById('configBtn');
const joystickBtn = document.getElementById('joystickBtn');


const configJoyBtn = document.getElementById('configJoyBtn');
const centerJoyBtn = document.getElementById('centerJoyBtn');
const cubeJoyBtn = document.getElementById('cubeJoyBtn');


function openJoystick() {
    const buttons = document.querySelector('.controls');
    buttons.style.display = 'none'

    const joyContainer = document.querySelector('.joystick-container-mobile');
    joyContainer.style.display = 'flex'

}

function open3DMap() {

}



let joystick;

function createJoystick(){
    const containerMobile = document.querySelector('.joystick-container-mobile');
    const joyMobElem = document.getElementById('joyDivMobile')
    const joyElem = document.getElementById('joyDiv')
    joyMobElem.innerHTML = ''
    joyElem.innerHTML = ''
    const container = document.querySelector('.joystick-container');
    if(window.getComputedStyle(containerMobile).display != 'none'){
        joystick = new JoyStick('joyDivMobile', {
            title: 'joystickMobile',
            internalFillColor: '#4cc9f0',
            internalStrokeColor: '#1f4068',
            externalStrokeColor: '#1f4068',
            autoReturnToCenter: true,
        });
    }
    if(window.getComputedStyle(container).display != 'none'){
        joystick = new JoyStick('joyDiv', {
            title: 'joystick',
            internalFillColor: '#4cc9f0',
            internalStrokeColor: '#1f4068',
            externalStrokeColor: '#1f4068',
            autoReturnToCenter: true,
        });
    }

}

function mapValue(value, inputMin, inputMax, outputMin, outputMax){
    const scale = (outputMax - outputMin) / (inputMax  - inputMin)
    return Math.floor(scale * value);
}

// Send data every 100ms
function handleJoystick(){
    if(!joystick) return;
    const stick = {
        posX: joystick.GetPosX(),
        posY: joystick.GetPosY(),
        x: parseInt(joystick.GetX()),
        y: parseInt(joystick.GetY()),
    }
    const maxVelocity = settingCfg.maxVelocity || 255;
    const velocity = mapValue(stick.y, -100, 100, -maxVelocity, maxVelocity);
    const gyro = mapValue(stick.x, -100, 100, -maxVelocity, maxVelocity);

    const leftMotor = velocity + gyro;
    const rightMotor = velocity - gyro;

    const leftMotorPwm = Math.max(Math.min(leftMotor, maxVelocity), -maxVelocity);
    const rightMotorPwm = Math.max(Math.min(rightMotor, maxVelocity), -maxVelocity);
    publishMotorMessage(leftMotorPwm, rightMotorPwm)
}
setInterval(handleJoystick, 100);


zoomInBtn.addEventListener('click', () => zoom('in'));
zoomOutBtn.addEventListener('click', () => zoom('out'));
resetViewBtn.addEventListener('click', resetView);
centerMapBtn.addEventListener('click', centerMap);
toggleGridBtn.addEventListener('click', toggleGrid);
configGridBtn.addEventListener('click', openSettings);
joystickBtn.addEventListener('click', openJoystick);

configJoyBtn.addEventListener('click', openSettings);
centerJoyBtn.addEventListener('click', centerMap);
cubeJoyBtn.addEventListener('click', open3DMap);


createJoystick()
window.addEventListener('resize', createJoystick);
