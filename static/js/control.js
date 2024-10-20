import { zoom, resetView, centerMap, toggleGrid } from './2Dmap.js'


const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetViewBtn = document.getElementById('resetView');
const centerMapBtn = document.getElementById('centerMap');
const toggleGridBtn = document.getElementById('toggleGrid');


zoomInBtn.addEventListener('click', () => zoom('in'));
zoomOutBtn.addEventListener('click', () => zoom('out'));
resetViewBtn.addEventListener('click', resetView);
centerMapBtn.addEventListener('click', centerMap);
toggleGridBtn.addEventListener('click', toggleGrid);
