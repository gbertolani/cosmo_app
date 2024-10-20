export let settingCfg = {
    host: 'ws://localhost:9090/',
    maxVelocity: 255,
}

export async function openSettings(){
    const result = await Swal.fire({
        title: 'Configuration',
        html: `
            <input type="text" id="socketHost" class="swal2-input" placeholder="WebSocket Host"
                value=${settingCfg.host}>
            <input type="text" id="maxVelocity" class="swal2-input" placeholder="Max Velocity"
                value=${settingCfg.maxVelocity}>
        `,
        // focusConfirm: false,
        // heightAuto: false,
        preConfirm: () => {
            const host = document.getElementById('socketHost').value;
            const maxVelocity = parseInt(document.getElementById('maxVelocity').value);
            if (!host) {
                Swal.showValidationMessage('Host is Requiered');
            }
            if(isNaN(maxVelocity) || maxVelocity < 0){
                Swal.showValidationMessage('Max Velocity must be positive');
            }
            return { host, maxVelocity };
        }
    })
    if(result.isConfirmed){
        settingCfg = result.value;
        localStorage.setItem('cosmoSettings', JSON.stringify(result.value));
        Swal.fire({
          title: "Saved!",
          text: "Config has been saved.",
          icon: "success"
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Auto open config
    const storageValues = localStorage.getItem('cosmoSettings');
    if(storageValues == null || !storageValues){
        openSettings();
    }
    settingCfg = JSON.parse(storageValues);
});




// Download
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installButton = document.getElementById('downloadBtn');
    installButton.style.display = 'block';

    installButton.addEventListener('click', () => {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
            installButton.style.display = 'none';
            deferredPrompt = null;
        });
    });
});
