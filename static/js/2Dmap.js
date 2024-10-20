const ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

ros.on('connection', () => console.log('Conectado a ROS 2.'));
ros.on('error', (error) => console.log('Error:', error));
ros.on('close', () => console.log('Desconectado de ROS 2.'));


const gridListener = new ROSLIB.Topic({
    ros,
    name: '/rtabmap/octomap_grid',
    messageType: 'nav_msgs/msg/OccupancyGrid'
});

const positionListener = new ROSLIB.Topic({
    ros,
    name: '/rtabmap/localization_pose',
    messageType: 'geometry_msgs/msg/PoseWithCovarianceStamped'
});

let mapData = null;
let mapResolution = null
let cmPerCell = null; // Cada celda representa 5cm

gridListener.subscribe((msg) => {
    const position = msg.info.origin.position;
    const orientation = msg.info.origin.orientation;
    if(mapResolution == null){
        mapResolution = msg.info.resolution
        cmPerCell = Math.floor(mapResolution * 100)
    }
    mapData = {
        width: msg.info.width,
        height: msg.info.height,
        origin: {
            position: {
                x: position.x,
                y: position.y,
                z: position.z,
            },
            orientation: {
                x: orientation.x,
                y: orientation.y,
                z: orientation.z,
                w: orientation.w,
            }
        },
        data: msg.data
    }
    resizeCanvas()
    drawMap();
});

positionListener.subscribe((msg) => {
    if(!mapData) return;
    const origin = mapData.origin;
    const position = msg.pose.pose.position
    const orientation = msg.pose.pose.orientation
    // resizeCanvas()
    drawMap();

    // Draw Robot
    drawRobotPosition(origin, position, orientation);

})


const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
// const zoomInBtn = document.getElementById('zoomIn');
// const zoomOutBtn = document.getElementById('zoomOut');
// const resetViewBtn = document.getElementById('resetView');
// const centerMapBtn = document.getElementById('centerMap');
// const toggleGridBtn = document.getElementById('toggleGrid');
const statusElement = document.getElementById('status');
const coordinatesElement = document.getElementById('coordinates');

let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX, lastY;
let showGrid = true;

let cellSize;

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    if (mapData) {
        // Ajustamos el tamaño de la celda al mapa recibido
        cellSize = Math.min(canvas.width / mapData.width, canvas.height / mapData.height);
    }
    centerMap();
}

function drawMap() {
    if (!mapData) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offsetX, offsetY);

    const width = mapData.width;
    const height = mapData.height;
    const data = mapData.data;

    const visibleStartX = Math.max(0, Math.floor(-offsetX / cellSize));
    const visibleStartY = Math.max(0, Math.floor(-offsetY / cellSize));
    const visibleEndX = Math.min(width, Math.ceil((canvas.width / scale - offsetX) / cellSize));
    const visibleEndY = Math.min(height, Math.ceil((canvas.height / scale - offsetY) / cellSize));

    for (let row = visibleStartY; row < visibleEndY; row++) {
        for (let col = visibleStartX; col < visibleEndX; col++) {
            const index = row * width + col;
            const value = data[index];

            switch(value) {
                case -1:
                    ctx.fillStyle = '#1f4068';  // Azul para celdas desconocidas
                    break;
                case 0:
                    ctx.fillStyle = '#2ed573'; // Verde para espacio libre
                    break;
                case 100:
                    ctx.fillStyle = '#808080'; // Gris para obstáculos
                    break;
                default:
                    ctx.fillStyle = '#1f4068';  // Color por defecto
            }

            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

            if (showGrid) {
                ctx.strokeStyle = '#0f3460';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.restore();
    drawScale();
}

function drawRobotPosition(origin, position, orientation) {
    if(!mapResolution) return;
    // Convertir la posición del robot a coordenadas del canvas considerando la resolución y el cellSize
    const robotX = ((position.x - origin.position.x) / mapResolution) * cellSize;
    const robotY = ((position.y - origin.position.y) / mapResolution) * cellSize;

    // Aplicar el zoom y el desplazamiento actual
    const canvasRobotX = robotX * scale + offsetX * scale;
    const canvasRobotY = robotY * scale + offsetY * scale;

    const yaw = quaternionToYaw(orientation);
    drawArrow(canvasRobotX, canvasRobotY, yaw);
}

function quaternionToYaw(orientation) {
    const { x, y, z, w } = orientation;
    const siny_cosp = 2 * (w * z + x * y);
    const cosy_cosp = 1 - 2 * (y * y + z * z);
    return Math.atan2(siny_cosp, cosy_cosp);
}

function drawArrow(x, y, angle) {
    const arrowLength = 15;
    const arrowWidth = 7;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowLength, -arrowWidth / 2);
    ctx.lineTo(-arrowLength, arrowWidth / 2);
    ctx.closePath();

    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.restore();
}

function drawScale() {
    const scaleCells = Math.min(10, mapData ? mapData.width : 10);
    const scaleLength = scaleCells * cellSize * scale;
    const scaleHeight = 30;
    const padding = 10;

    const startX = canvas.width - scaleLength - padding;
    const startY = canvas.height - scaleHeight - padding - 5;

    // Dibujar fondo de la escala
    ctx.fillStyle = 'rgba(22, 33, 62, 0.8)';
    ctx.fillRect(startX - padding, startY - padding, scaleLength + padding * 2, scaleHeight + padding * 2);

    // Dibujar línea de escala
    ctx.beginPath();
    ctx.moveTo(startX, startY + scaleHeight / 2);
    ctx.lineTo(startX + scaleLength, startY + scaleHeight / 2);
    ctx.strokeStyle = '#4cc9f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujar marcas y etiquetas
    ctx.fillStyle = '#4cc9f0';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i <= scaleCells; i++) {
        const x = startX + i * (scaleLength / scaleCells);
        ctx.beginPath();
        ctx.moveTo(x, startY + scaleHeight / 2);
        ctx.lineTo(x, startY + scaleHeight);
        ctx.stroke();

        if (i % 2 === 0 || i === scaleCells) {
            const label = i * cmPerCell;
            ctx.fillText(`${label}`, x, startY + scaleHeight );
        }
    }

    // Dibujar etiqueta de longitud total
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '14px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(`${scaleCells * cmPerCell} cm`, canvas.width - padding, startY - padding);
}

export function zoom(direction, mouseX, mouseY) {
    const zoomFactor = direction === 'in' ? 1.1 : 0.9;
    const oldScale = scale;
    scale *= zoomFactor;
    scale = Math.max(0.1, Math.min(scale, 10));

    const zoomPointX = mouseX !== undefined ? mouseX : canvas.width / 2;
    const zoomPointY = mouseY !== undefined ? mouseY : canvas.height / 2;

    offsetX -= (zoomPointX / oldScale - zoomPointX / scale);
    offsetY -= (zoomPointY / oldScale - zoomPointY / scale);

    drawMap();
    updateStatus('Zoomed ' + (direction === 'in' ? 'in' : 'out'));
}

export function resetView() {
    scale = 1;
    centerMap();
    updateStatus('View reset');
}

export function centerMap() {
    if (!mapData) return;
    offsetX = (canvas.width / scale - mapData.width * cellSize) / 2;
    offsetY = (canvas.height / scale - mapData.height * cellSize) / 2;
    drawMap();
    updateStatus('Map centered');
}

export function toggleGrid() {
    showGrid = !showGrid;
    drawMap();
    updateStatus(showGrid ? 'Grid shown' : 'Grid hidden');
}

function updateStatus(message) {
    statusElement.textContent = message;
}

function updateCoordinates(x, y) {
    const cmX = x * cmPerCell;
    const cmY = y * cmPerCell;
    coordinatesElement.textContent = `X: ${cmX} cm, Y: ${cmY} cm`;
}

function getCellCoordinates(x, y) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;

    const mapX = Math.floor((canvasX / scale - offsetX) / cellSize);
    const mapY = Math.floor((canvasY / scale - offsetY) / cellSize);

    return { x: mapX, y: mapY };
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    updateStatus('Dragging map');
});

canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getCellCoordinates(e.clientX, e.clientY);
    updateCoordinates(x, y);

    if (isDragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        offsetX += deltaX / scale;
        offsetY += deltaY / scale;
        lastX = e.clientX;
        lastY = e.clientY;
        drawMap();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    updateStatus('Ready');
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    zoom(e.deltaY > 0 ? 'out' : 'in', mouseX, mouseY);
});

// zoomInBtn.addEventListener('click', () => zoom('in'));
// zoomOutBtn.addEventListener('click', () => zoom('out'));
// resetViewBtn.addEventListener('click', resetView);
// centerMapBtn.addEventListener('click', centerMap);
// toggleGridBtn.addEventListener('click', toggleGrid);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateStatus('Ready');
