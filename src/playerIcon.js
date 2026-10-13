// Inline vector keeps the map avatar sharp on high-density mobile screens.
export const PLAYER_ICON_HTML = `
 <div class="player-range"></div>
 <div class="player-heading"></div>
 <div class="player-avatar">
  <svg viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
   <ellipse cx="24" cy="55" rx="13" ry="3" fill="#17457e" opacity=".18"/>
   <g stroke="#fff" stroke-width="1.5" stroke-linejoin="round">
    <path d="M17 40h14l-2 13h-6l-1-9-1 9h-6z" fill="#253c5e"/>
    <rect x="10" y="26" width="11" height="19" rx="5" fill="#7ca9df"/>
    <path d="M17 28l-4 3-3 10a3 3 0 0 0 5 2l4-10m11-5 5 4 3 9a3 3 0 0 1-5 2l-4-10" fill="#edbc94"/>
    <path d="M18 26h12l4 9-4 3 1 8H16l1-8-4-3z" fill="#2462aa"/>
    <path d="M21 23h7v6c-2 2-5 2-7 0z" fill="#edbc94"/>
    <circle cx="24" cy="16" r="9" fill="#f4c9a4"/>
    <path d="M15 16v-3a9 9 0 0 1 18 0v3l-5-5-6 3-4-1v4z" fill="#203b60"/>
    <path d="M14 12c0-7 6-9 10-9s10 2 10 9z" fill="#17457e"/>
    <path d="M14 12h21" fill="none" stroke="#87b9f4" stroke-width="3" stroke-linecap="round"/>
    <path d="M16 51h5v4h-8c-1-2 1-4 3-4zm8 0h5l3 4h-8z" fill="#17457e"/>
   </g>
   <path d="M17 28l3 13m10-13-3 13" stroke="#a6c9f0" stroke-width="2" stroke-linecap="round"/>
   <rect x="21" y="34" width="5" height="5" rx="1.5" fill="#e4f0ff"/>
   <circle cx="21" cy="18" r=".9" fill="#37455a"/>
   <circle cx="28" cy="18" r=".9" fill="#37455a"/>
   <path d="M23 22h3" stroke="#bd8063" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
 </div>
 <div class="player-label">VOCÊ</div>`;
