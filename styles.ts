
export const AppStyles = `
  :root {
    /* Light Mode Variables (Default) */
    --bg-color: #F3F4F6;
    --card-bg-color: #FFFFFF;
    --text-color: #1F2937;
    --subtle-text-color: #6B7280;
    --border-color: #E5E7EB;
    
    --primary-green: #78BD42;
    --primary-green-dark: #639c36;
    --primary-orange: #F78D1E;
    --primary-gradient: linear-gradient(135deg, #2a2c37, var(--primary-green));
    --sidebar-bg: var(--primary-gradient);
    
    --neutral-gray: #CBD5E0;
    --light-gray: #F9FAFB;
    
    --heatmap-max-border: #1f2028;
    --heatmap-text-high: #064e3b;
    --heatmap-bg-empty: rgba(243, 244, 246, 0.4);
    
    --sidebar-width: 250px;
    --header-height: 80px;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --border-radius: 16px;
    --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* Dark Mode Variables - High Contrast Update */
  body.dark-mode {
    --bg-color: #0F172A; /* Slate 900 */
    --card-bg-color: #1E293B; /* Slate 800 */
    --text-color: #F8FAFC; /* Slate 50 - Brighter/Whiter for readability */
    --subtle-text-color: #CBD5E1; /* Slate 300 - Much lighter gray */
    --border-color: #334155; /* Slate 700 */
    
    --light-gray: #334155; /* Used for table headers in dark mode */
    --neutral-gray: #475569;

    --heatmap-max-border: #F8FAFC;
    --heatmap-text-high: #DCFCE7; /* Light green text */
    --heatmap-bg-empty: rgba(30, 41, 59, 0.6);

    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
  }
  
  * { box-sizing: border-box; }
  
  /* --- Fluid Typography --- */
  html { font-size: 16px; }
  @media (min-width: 1921px) { html { font-size: 17px; } }
  @media (min-width: 2200px) { html { font-size: 19px; } }
  @media (min-width: 2500px) { html { font-size: 21px; } }

  body {
    font-family: var(--font-family);
    background-color: var(--bg-color);
    color: var(--text-color);
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  #root { display: flex; min-height: 100vh; }
  
  /* --- Animations --- */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalEntrance {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pulse-orange {
    0% { box-shadow: 0 0 0 0 rgba(247, 141, 30, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(247, 141, 30, 0); }
    100% { box-shadow: 0 0 0 0 rgba(247, 141, 30, 0); }
  }

  /* --- Login Page Styles --- */
  .login-page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background-color: var(--bg-color);
  }
  .login-container {
    width: 100%;
    max-width: 1000px;
    background: var(--card-bg-color);
    border-radius: 24px;
    box-shadow: var(--shadow-xl);
    display: grid;
    grid-template-columns: 45% 55%;
    align-items: stretch;
    overflow: hidden;
    min-height: 600px;
  }
  .login-promo {
    background: var(--primary-gradient);
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
    gap: 32px;
    position: relative;
    overflow: hidden;
  }
  .login-promo::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%);
  }
  .promo-map-image {
    max-width: 160px;
    margin: 0;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
    transition: transform 0.5s ease;
  }
  .login-promo:hover .promo-map-image {
    transform: scale(1.05) rotate(-2deg);
  }
  .login-promo h2 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.2;
    font-weight: 800;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .login-promo p {
    margin: 0;
    color: rgba(255,255,255,0.95);
    line-height: 1.6;
    font-size: 1.05rem;
    font-weight: 500;
  }
  .login-form-container {
    padding: 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .form-logo {
    display: block;
    margin: 0 auto 40px;
    max-width: 180px;
  }
  body.dark-mode .form-logo {
    filter: brightness(0) invert(1); 
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: space-between;
    height: 100%;
  }
  .form-group.full-width {
    grid-column: span 2 / span 2;
  }
  .form-group label {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-color);
    letter-spacing: 0.02em;
  }
  .form-input, .form-select {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--light-gray);
    font-size: 0.95rem;
    font-family: inherit;
    color: var(--text-color);
    transition: all 0.2s ease;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
  }
  .form-input::placeholder {
      color: var(--subtle-text-color);
      opacity: 0.7;
  }
  .form-input:focus, .form-select:focus {
    outline: none;
    border-color: var(--primary-green);
    background-color: var(--card-bg-color);
    box-shadow: 0 0 0 3px rgba(120, 189, 66, 0.15);
  }
  .login-button {
    width: 100%;
    padding: 16px;
    margin-top: 32px;
    background: var(--primary-green);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(120, 189, 66, 0.3);
  }
  .login-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(120, 189, 66, 0.4);
    background-color: var(--primary-green-dark);
  }
  .error-message {
    color: #ef4444;
    font-size: 0.9rem;
    margin-top: 20px;
    text-align: center;
    background: #fef2f2;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #fee2e2;
    font-weight: 500;
  }
  
  /* --- Modal Styles (Region & Export) --- */
  .region-modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    animation: fadeIn 0.3s ease-out;
  }
  .region-modal-content {
    background: var(--card-bg-color);
    padding: 40px;
    border-radius: 24px;
    box-shadow: var(--shadow-xl);
    text-align: center;
    max-width: 700px;
    width: 100%;
    position: relative;
    animation: modalEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid var(--border-color);
  }
  .region-modal-icon {
    width: 72px;
    height: 72px;
    background: rgba(247, 141, 30, 0.1); 
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: var(--primary-orange);
    box-shadow: 0 4px 15px rgba(247, 141, 30, 0.2); 
  }
  .region-modal-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-color);
    margin: 0 0 12px 0;
    letter-spacing: -0.02em;
  }
  .region-modal-subtitle {
    font-size: 1rem;
    color: var(--subtle-text-color);
    margin: 0 0 32px 0;
    line-height: 1.5;
  }
  .region-modal-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  .region-modal-button {
    background: var(--card-bg-color);
    border: 2px solid var(--border-color);
    padding: 14px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .region-modal-button:hover {
    border-color: var(--primary-orange);
    color: var(--primary-orange);
    background-color: rgba(247, 141, 30, 0.1);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .region-modal-all-button {
    width: 100%;
    margin-top: 12px;
    padding: 16px;
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(120, 189, 66, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .region-modal-all-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(120, 189, 66, 0.3);
    filter: brightness(1.05);
  }

  /* --- Sidebar Styles --- */
  .sidebar {
    width: var(--sidebar-width);
    background: var(--sidebar-bg);
    padding: 32px 16px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    z-index: 1100;
    box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    will-change: transform;
  }
  
  .mobile-close-sidebar {
    display: none !important;
  }

  .sidebar-header {
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
    position: relative;
  }
  .sidebar-logo {
    max-width: 190px;
    width: 100%;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    margin: 0 auto;
    display: block;
  }
  .sidebar-nav {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.75);
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.9rem;
    border: 1px solid transparent;
  }
  .nav-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  .nav-item.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    font-weight: 700;
    border-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .sidebar-footer {
      margin-top: auto;
      width: 100%;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .theme-toggle-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    margin: 0 auto 8px auto; 
  }
  .theme-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
    color: white;
    transform: scale(1.05);
  }
  
  .sidebar-sub-btn {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.85);
      padding: 8px 10px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      transition: all 0.2s ease;
      text-decoration: none;
      font-size: 0.75rem; 
  }
  .sidebar-sub-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.25);
      color: white;
  }

  .features-dropdown {
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    background: rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    margin-top: 4px;
  }
  .features-dropdown.open { max-height: 500px; padding: 4px; }
  .features-dropdown.closed { max-height: 0; }
  
  .feature-link {
    display: block;
    padding: 6px 12px;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.75rem;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .feature-link:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }

  .logout-button {
      width: 100%;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-weight: 600;
      transition: all 0.2s;
      font-size: 0.85rem;
  }
  .logout-button:hover {
      color: #fee2e2;
  }

  .modal-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    color: var(--text-color);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  .modal-close-btn:hover {
    color: var(--primary-orange);
  }
  
  /* --- Main Content --- */
  .content-wrapper { 
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color);
    transition: background-color 0.3s ease;
  }
  .header {
    height: var(--header-height);
    background: var(--card-bg-color);
    opacity: 0.95;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: var(--shadow-sm);
  }
  .header-left { display: flex; align-items: center; gap: 20px; }
  
  .mobile-menu-toggle {
    display: none;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-color);
  }

  .header h1 { 
    font-size: 1.5rem; 
    margin: 0; 
    font-weight: 800; 
    color: var(--text-color);
    letter-spacing: -0.02em;
  }
  .pdf-button {
    background: var(--primary-gradient);
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(120, 189, 66, 0.2);
  }
  .pdf-button svg {
      width: 16px;
      height: 16px;
  }
  .pdf-button:hover { 
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(120, 189, 66, 0.3);
  }
  .pdf-button:disabled {
    background: var(--neutral-gray);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .main-content { 
    min-height: calc(100vh - var(--header-height)); 
    flex: 1; 
    padding: 40px; 
    max-width: 2200px;
    margin: 0 auto;
    width: 100%;
  }
  
  .dashboard-section { margin-bottom: 32px; }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 0;
    border-bottom: none;
  }
  .section-header h2 {
    margin: 0;
    font-size: 1.35rem; 
    font-weight: 800;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 12px;
    letter-spacing: -0.01em;
  }
  .section-header h2::before {
    content: '';
    display: block;
    width: 6px;
    height: 28px;
    background: var(--primary-green);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(120, 189, 66, 0.4);
  }
  
  .grid { display: grid; gap: 32px; }
  .grid-cols-1 { grid-template-columns: 1fr; }
  .grid-cols-2 { grid-template-columns: 1fr 1fr; }
  .grid-cols-3 { grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); }
  .grid-cols-4 { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .col-span-2 { grid-column: span 2; }
  
  .card {
    background-color: var(--card-bg-color);
    padding: 32px;
    border-radius: 20px;
    box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    content-visibility: auto; 
    contain-intrinsic-size: 0 500px;
  }
  .card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, transparent, rgba(120, 189, 66, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-xl);
    border-color: rgba(120, 189, 66, 0.3);
  }
  .card:hover::after { opacity: 1; }
  
  .card h3 { 
    margin-top: 0; 
    margin-bottom: 20px; 
    font-size: 1.15rem; 
    font-weight: 700;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  .card .card-description {
    font-size: 0.95rem; 
    font-weight: 500;   
    color: var(--subtle-text-color);
    line-height: 1.6;
    margin-top: 0;
    margin-bottom: 32px;
    flex-grow: 1;
  }

  .explain-btn {
    background-color: rgba(255, 247, 237, 1); 
    color: #EA580C;
    border: 1px solid #FFEDD5;
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    animation: pulse-orange 3s infinite;
  }
  body.dark-mode .explain-btn {
    background-color: rgba(247, 141, 30, 0.1);
    border-color: rgba(247, 141, 30, 0.3);
  }
  .explain-btn:hover {
    background-color: var(--primary-orange);
    color: white;
    border-color: var(--primary-orange);
    box-shadow: 0 4px 12px rgba(247, 141, 30, 0.4);
    animation: none;
    transform: translateY(-1px);
  }

  .kpi-card {
    padding: 24px;
    border-top: 4px solid var(--primary-orange);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    height: 100%;
    background-color: var(--card-bg-color);
  }
  .kpi-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    width: 100%;
    margin-bottom: 8px;
  }
  .kpi-icon {
    width: 48px;
    height: 48px;
    background-color: rgba(247, 141, 30, 0.1);
    border-radius: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    color: var(--primary-orange);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
  }
  .kpi-card .label { 
      font-size: 0.75rem; 
      font-weight: 700; 
      color: var(--subtle-text-color); 
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
  }
  .kpi-card .value { 
      font-size: 1.5rem; 
      font-weight: 800; 
      color: var(--text-color); 
      line-height: 1.2;
      letter-spacing: -0.02em;
  }
  .kpi-card .card-description {
    margin-bottom: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--subtle-text-color);
  }

  /* --- Heatmap & Charts --- */
  .heatmap table { border-collapse: separate; border-spacing: 6px; width: 100%; }
  .heatmap th, .heatmap td { border: none; padding: 14px 8px; text-align: center; border-radius: 8px; transition: transform 0.2s; }
  .heatmap td:hover { transform: scale(1.05); z-index: 10; box-shadow: var(--shadow-md); }
  .heatmap th { background-color: var(--light-gray); font-size: 0.8rem; color: var(--subtle-text-color); font-weight: 700; text-transform: uppercase; }
  .heatmap .row-header { text-align: left; background-color: transparent; color: var(--text-color); font-weight: 600; }
  .heatmap-tooltip {
      background: var(--card-bg-color);
      color: var(--text-color);
      padding: 12px;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      font-size: 0.8rem;
      pointer-events: none;
      white-space: pre-line;
      z-index: 2000;
      position: absolute;
      border: 1px solid var(--border-color);
  }

  /* --- Enhanced Detailed Table Styles --- */
  .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
  }
  
  .detailed-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    white-space: nowrap;
    background-color: var(--card-bg-color);
  }
  
  .detailed-table th {
    background-color: var(--light-gray);
    color: var(--subtle-text-color);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    padding: 16px 24px;
    text-align: left;
    border-bottom: 2px solid var(--border-color);
    cursor: pointer;
    transition: background-color 0.2s;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .detailed-table th:hover {
    background-color: var(--bg-color);
    color: var(--text-color);
  }
  
  .detailed-table td {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-color);
    vertical-align: middle;
  }
  
  .detailed-table tbody tr {
    transition: background-color 0.15s ease;
  }
  .detailed-table tbody tr:hover {
    background-color: var(--bg-color);
  }
  
  .detailed-table tbody tr:nth-child(even) {
    background-color: rgba(0,0,0,0.02);
  }
  body.dark-mode .detailed-table tbody tr:nth-child(even) {
      background-color: rgba(255,255,255,0.02);
  }

  .detailed-table tbody tr:last-child td {
    border-bottom: none;
  }
  
  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-color);
    color: var(--subtle-text-color);
    font-weight: 700;
    font-size: 0.85rem;
    border: 1px solid var(--border-color);
  }
  .rank-badge.top-3 {
    background: rgba(247, 141, 30, 0.1);
    color: #EA580C;
    border: 1px solid rgba(247, 141, 30, 0.3);
  }
  
  .text-badge {
    display: inline-block;
    padding: 4px 10px;
    background-color: var(--bg-color);
    color: var(--text-color);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid var(--border-color);
  }

  .response-cell {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 140px;
  }
  .response-val {
      font-weight: 700;
      color: var(--text-color);
  }
  .response-bar-track {
      width: 100%;
      height: 6px;
      background-color: var(--border-color);
      border-radius: 4px;
      overflow: hidden;
  }
  .response-bar-fill {
      height: 100%;
      background: var(--primary-green);
      border-radius: 4px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .csv-export-button {
    background: var(--card-bg-color);
    color: var(--subtle-text-color);
    border: 1px solid var(--border-color);
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    box-shadow: var(--shadow-sm);
  }
  .csv-export-button:hover {
    border-color: var(--primary-green);
    color: var(--primary-green);
    background: rgba(120, 189, 66, 0.1);
    box-shadow: var(--shadow-md);
  }
  
  .ricardo-suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
  }

  .ricardo-chip {
      background: var(--card-bg-color);
      border: 1px solid var(--primary-green);
      color: var(--primary-green);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
  }

  .ricardo-chip:hover {
      background: var(--primary-green);
      color: white;
  }

  /* --- RICARDO AI ASSISTANT --- */
  
  .ricardo-fab {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 64px; 
    height: 64px; 
    border-radius: 50%;
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(247, 141, 30, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 2100;
    padding: 0;
    background: white;
    animation: pulse-orange 4s infinite;
  }
  .ricardo-fab:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 12px 30px rgba(247, 141, 30, 0.6);
    animation: none;
  }
  .ricardo-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .ricardo-chat-window {
    position: fixed;
    bottom: 110px; 
    right: 30px;
    width: 380px;
    max-width: 90vw;
    height: 600px;
    max-height: 80vh;
    background-color: var(--card-bg-color); 
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    transform: scale(0.95) translateY(20px);
    opacity: 0;
    pointer-events: none;
    z-index: 2147483647; 
    backface-visibility: hidden; 
    will-change: transform, opacity;
  }
  .ricardo-chat-window.open {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: all;
  }
  
  .ricardo-banner {
    background: linear-gradient(135deg, #F78D1E 0%, #FFB347 100%);
    height: 120px;
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    padding-top: 20px;
  }

  .ricardo-banner-logo {
      height: 32px; 
      width: auto;
      object-fit: contain;
      mix-blend-mode: multiply;
      filter: contrast(1.1);
      opacity: 0.8;
  }
  
  .ricardo-close-btn {
      position: absolute;
      right: 16px;
      top: 16px;
      background: rgba(0,0,0,0.1);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
      backdrop-filter: blur(4px);
  }
  .ricardo-close-btn:hover {
      background: rgba(0,0,0,0.2);
  }

  .ricardo-profile-bar {
      background: var(--card-bg-color);
      width: 90%;
      margin: -45px auto 0 auto;
      border-radius: 20px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      position: relative;
      z-index: 10;
  }
  .ricardo-header-avatar {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    border: 3px solid var(--card-bg-color);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
  .ricardo-header-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
  }
  
  .ricardo-profile-info {
      text-align: left;
      flex: 1;
  }
  .ricardo-profile-info h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-color);
      font-weight: 800;
      letter-spacing: -0.02em;
  }
  .ricardo-status-text {
      font-size: 0.8rem;
      color: #10B981;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
  }
  .ricardo-status-text::before {
      content: '';
      display: block;
      width: 8px;
      height: 8px;
      background-color: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }

  .ricardo-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    scroll-behavior: smooth;
    background-color: var(--bg-color);
  }
  .ricardo-messages::-webkit-scrollbar { width: 6px; }
  .ricardo-messages::-webkit-scrollbar-track { background: transparent; }
  .ricardo-messages::-webkit-scrollbar-thumb { background-color: var(--neutral-gray); border-radius: 20px; }

  .ricardo-message {
    padding: 14px 18px;
    border-radius: 20px;
    max-width: 85%;
    line-height: 1.6;
    font-size: 0.95rem;
    position: relative;
    white-space: pre-wrap;
    animation: fadeIn 0.3s ease-out;
    word-break: break-word;
    box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  }
  
  .ricardo-message.user {
    background: linear-gradient(135deg, var(--primary-orange), #EA580C);
    color: white;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
    box-shadow: 0 4px 12px rgba(247, 141, 30, 0.25);
  }
  
  .ricardo-message.ricardo {
    background-color: var(--card-bg-color);
    color: var(--text-color);
    border-bottom-left-radius: 4px;
    align-self: flex-start;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .ricardo-action-btn {
    display: block;
    margin-top: 8px;
    background: white;
    color: var(--primary-orange);
    text-align: center;
    padding: 12px 20px;
    border-radius: 14px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #FED7AA;
    align-self: flex-start;
    max-width: 90%;
  }
  .ricardo-action-btn:hover {
    background: #FFF7ED;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(247, 141, 30, 0.15);
  }
  
  .typing-indicator {
      display: flex;
      gap: 6px;
      padding: 8px 6px;
      align-items: center;
      height: 24px;
  }
  .typing-dot {
      width: 8px;
      height: 8px;
      background: var(--subtle-text-color);
      border-radius: 50%;
      opacity: 0.6;
      animation: bounce 1.4s infinite ease-in-out both;
  }
  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
  }
  
  .ricardo-input-area {
    padding: 20px;
    background: var(--card-bg-color);
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-shrink: 0;
    border-top: 1px solid var(--border-color);
  }
  
  .ricardo-input {
    flex: 1;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 14px 18px;
    font-family: inherit;
    font-size: 0.95rem;
    resize: none;
    min-height: 50px;
    max-height: 120px;
    outline: none;
    transition: all 0.2s;
    background: var(--bg-color);
    line-height: 1.5;
    color: var(--text-color);
  }
  .ricardo-input:focus {
    border-color: var(--primary-orange);
    background: var(--card-bg-color);
    box-shadow: 0 0 0 4px rgba(247, 141, 30, 0.1);
  }
  .ricardo-input::placeholder {
      color: var(--subtle-text-color);
  }
  
  .ricardo-send-btn {
    background: var(--primary-orange);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(247, 141, 30, 0.3);
    margin-bottom: 2px;
  }
  .ricardo-send-btn:hover:not(:disabled) {
    background-color: #EA580C;
    transform: scale(1.1);
    box-shadow: 0 8px 20px rgba(247, 141, 30, 0.4);
  }
  .ricardo-send-btn:disabled {
    background-color: var(--neutral-gray);
    box-shadow: none;
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* --- PDF Export Specific Styles --- */
  /* Styles are now injected directly in App.tsx for better control */
  .pdf-export-mode {
    background-color: white !important;
  }

  .gauge-container {
    height: 220px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
  }

  /* --- MOBILE OPTIMIZATION --- */
  @media (max-width: 768px) {
    .login-page {
        align-items: flex-start;
        height: auto;
        padding: 12px;
        overflow-y: auto;
    }

    .login-container { 
        grid-template-columns: 1fr; 
        min-height: auto; 
        margin-top: 20px; 
        margin-bottom: 20px;
        width: 100%;
        overflow: visible; 
    }

    .login-promo { 
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px 16px;
      gap: 12px;
      min-height: auto;
    }
    .promo-map-image { max-width: 60px; margin: 0; }
    .login-promo h2 { font-size: 1.25rem; }
    .login-promo p { font-size: 0.85rem; }
    
    .login-form-container { padding: 32px 20px; }
    .form-logo { margin-bottom: 20px; max-width: 140px; }

    .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    .form-group.full-width {
        grid-column: span 1;
    }
    .form-input, .form-select {
        font-size: 16px; 
        padding: 12px;
    }
    
    .sidebar {
      transform: translateX(-100%);
      position: fixed; left: 0; top: 0; bottom: 0;
      width: 85%; max-width: 320px;
    }
    .sidebar.mobile-open { transform: translateX(0); }
    .mobile-close-sidebar {
      display: flex !important;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 20px;
      right: 20px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      z-index: 20;
    }
    .mobile-menu-toggle { display: block; }
    .header { padding: 0 20px; }
    .main-content { padding: 20px; }
    .region-modal-content { padding: 24px; margin: 20px; }
    .region-modal-buttons { grid-template-columns: 1fr; }
    .ricardo-chat-window {
      width: 100%; height: 100%; top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 0;
      max-width: none;
      max-height: none;
      z-index: 3000;
    }
    .ricardo-fab { bottom: 20px; right: 20px; }
    .dashboard-section { margin-bottom: 24px; }
    
    .card { padding: 20px; }

    .grid-cols-4, .grid-cols-2, .grid-cols-3 {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    .col-span-2 {
        grid-column: auto;
    }

    .header h1 {
        font-size: 1.1rem;
    }
    .pdf-button {
        padding: 8px 12px;
        font-size: 0.75rem;
    }
  }
`;
