import { settingCfg } from './settings.js'

export const ros = new ROSLIB.Ros({
    url: settingCfg.host
});

ros.on('connection', () => console.log('Conectado a ROS 2.'));
ros.on('error', (error) => console.log('Error:', error));
ros.on('close', () => console.log('Desconectado de ROS 2.'));
