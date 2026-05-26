const fs = require('fs');
const path = 'C:\\Users\\luiza\\Documents\\PicWish\\Cultura Viva\\museus-frontend\\src\\styles.css';

const cssToAppend = `

/* ==========================================================================
   MOBILE RESPONSIVENESS & PWA ENHANCEMENTS 
   (Appended from Audit)
   ========================================================================== */

/* 1. Touch Targets (Apple HIG & Material minimum 44/48px) */
.btn, 
button, 
.nav-item, 
.app-sidebar-link,
[role="button"] {
    min-height: 48px;
}

/* Specific fix for floating action buttons or very small icons that intentionally break the rule */
.btn-sm, .logout-btn-minimal, .menu-toggle {
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* 2. Prevent iOS Safari Auto-Zoom on Inputs */
@media screen and (max-width: 768px) {
    input, select, textarea {
        font-size: 16px !important;
    }
    
    /* 3. Mobile Buttons Full Width */
    .btn {
        width: 100%;
    }
    
    .btn.btn-inline {
        width: auto;
    }
}

/* 3. Fluid Typography for Headings */
h1, .premium-title, .app-title {
    font-size: clamp(1.5rem, 5vw, 3rem);
}
h2, .section-title {
    font-size: clamp(1.25rem, 4vw, 2rem);
}

/* 4. Safe Areas for Sidebar Layouts (Producer & Admin) */
.layout-wrapper main, 
.app-content {
    /* Ensure there's space at the bottom for the home indicator */
    padding-bottom: calc(80px + env(safe-area-inset-bottom)) !important;
}

.layout-sidebar, 
.app-sidebar {
    padding-bottom: calc(2rem + env(safe-area-inset-bottom)) !important;
}

/* Prevent text overlap on small devices */
.app-subtitle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
`;

fs.appendFileSync(path, cssToAppend, 'utf8');
console.log('Appended mobile CSS to styles.css');
