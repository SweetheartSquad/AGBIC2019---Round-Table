import './assets/style.css';

const loadEl = document.createElement('span');
loadEl.className = 'loading';
loadEl.textContent = 'loading';
document.body.appendChild(loadEl);

import('./phaser-main').then(() => {
	loadEl.remove();
});
