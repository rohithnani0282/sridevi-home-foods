// YOUR WHATSAPP NUMBER (India: 91 + number, no +). Set to your number:
const WHATSAPP_NUMBER = '919866406807';

const DEFAULT_HOME_FOODS = [
  { id: 'rice', name: 'Sona Masoori Rice', pricePerKg: 320, desc: 'Aromatic everyday rice', image: 'images/rice.jpg' },
  { id: 'mixveg', name: 'Mixed Veg (home)', pricePerKg: 350, desc: 'Seasonal vegetables, home-style', image: 'images/mixveg.jpg' },
  { id: 'sakinalu', name: 'Sakinalu', pricePerKg: 300, desc: 'Crispy sesame rice snack, traditional', image: 'images/sakinalu.jpg' },
  { id: 'madugulu', name: 'Madugulu', pricePerKg: 300, desc: 'Steamed rice dumplings, soft and fluffy', image: 'images/madugulu.jpg' },
  { id: 'laddus', name: 'Laddus', pricePerKg: 400, desc: 'Sweet gram flour laddus, handmade', image: 'images/laddus.jpg' }
];

const DEFAULT_PICKLES = [
  { id: 'mango', name: 'Mango Pickle (veg)', price: 150, kind: 'veg', image: 'images/mango.jpg' },
  { id: 'lime', name: 'Lime Pickle (veg)', price: 120, kind: 'veg', image: 'images/lime.jpg' },
  { id: 'chicken', name: 'Chicken Pickle (non-veg)', price: 220, kind: 'non-veg', image: 'images/chicken.jpeg' }
];

// Load from localStorage, fallback to defaults
let HOME_FOODS = JSON.parse(localStorage.getItem('HOME_FOODS')) || DEFAULT_HOME_FOODS;
let PICKLES = JSON.parse(localStorage.getItem('PICKLES')) || DEFAULT_PICKLES;

let cart = [];

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

function createProductCard(item, type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-card';
  wrapper.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: transform 0.3s ease;
  `;
  
  const left = document.createElement('div');
  left.style.cssText = `
    display: flex;
    align-items: center;
    flex: 1;
  `;
  
  const img = document.createElement('img');
  img.style.cssText = `
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 15px;
  `;
  img.src = item.image || 'https://via.placeholder.com/80x60?text=Image';
  img.alt = item.name;
  
  const _fallbackSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="100%" height="100%" fill="#f8f9fa"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#495057" font-size="12">Image</text></svg>';
  img.onerror = () => {
    try {
      if (img.src && img.src.match(/\.jpg(\?|$)/i)) {
        img.src = img.src.replace(/\.jpg(\?|$)/i, '.svg$1');
        return;
      }
    } catch (e) {}
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(_fallbackSVG);
    img.onerror = null;
  };
  
  const info = document.createElement('div');
  info.innerHTML = `
    <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 1.1rem;">${item.name}</h3>
    <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">${item.desc || (item.kind || '')}</p>
  `;
  
  left.appendChild(img);
  left.appendChild(info);

  const right = document.createElement('div');
  right.style.cssText = `
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  `;
  
  const priceText = type === 'home' ? '₹' + item.pricePerKg + '/kg' : '₹' + item.price + ' / jar';
  right.innerHTML = `<div style="font-weight: bold; color: #2c3e50; margin-bottom: 10px;">${priceText}</div>`;
  
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  
  const qty = document.createElement('input');
  qty.type = 'number';
  qty.min = 1;
  qty.value = 1;
  qty.style.cssText = `
    width: 60px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
  `;
  
  const btn = document.createElement('button');
  btn.textContent = 'Add to Cart';
  btn.style.cssText = `
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;
  `;
  
  btn.onmouseover = () => {
    btn.style.background = '#2980b9';
  };
  
  btn.onmouseout = () => {
    btn.style.background = '#3498db';
  };
  
  btn.onclick = () => {
    const q = type === 'home' ? parseFloat(qty.value || 1) : parseInt(qty.value || 1);
    addToCart(Object.assign({}, item), type, q);
    // Visual feedback
    btn.textContent = 'Added!';
    btn.style.background = '#27ae60';
    setTimeout(() => {
      btn.textContent = 'Add to Cart';
      btn.style.background = '#3498db';
    }, 1000);
  };
  
  controls.appendChild(qty);
  controls.appendChild(btn);
  right.appendChild(controls);

  const body = document.createElement('div');
  body.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  `;
  
  body.appendChild(left);
  body.appendChild(right);
  wrapper.appendChild(body);
  
  // Add hover effect
  wrapper.onmouseover = () => {
    wrapper.style.transform = 'translateY(-2px)';
    wrapper.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
  };
  
  wrapper.onmouseout = () => {
    wrapper.style.transform = 'translateY(0)';
    wrapper.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  };
  
  return wrapper;
}

function renderCatalog() {
  const menuGrid = $('#menuGrid');
  if (menuGrid) {
    menuGrid.innerHTML = '';
    
    // Add all items to menu grid
    const allItems = [
      ...HOME_FOODS.map(item => ({...item, category: 'home'})),
      ...PICKLES.map(item => ({...item, category: 'pickle'}))
    ];
    
    allItems.forEach(item => {
      menuGrid.appendChild(createProductCard(item, item.category));
    });
  }
  
  // Also try to load into old containers if they exist
  const hList = $('#homeFoodsList');
  if (hList) {
    hList.innerHTML = '';
    HOME_FOODS.forEach(i => hList.appendChild(createProductCard(i, 'home')));
  }
  const pList = $('#picklesList');
  if (pList) {
    pList.innerHTML = '';
    PICKLES.forEach(i => pList.appendChild(createProductCard(i, 'pickle')));
  }
}

function addToCart(item, type, qty) {
  if (type === 'home' && qty < 1) qty = 1;
  const existing = cart.find(c => c.id === item.id && c.type === type);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      type,
      qty,
      unit: type === 'home' ? 'kg' : 'jar',
      unitPrice: type === 'home' ? item.pricePerKg : item.price
    });
  }
  renderCart();
}

function renderCart() {
  const area = $('#cartContent') || $('#cartArea'); // Try both elements
  if (!area) return; // Exit if no cart element found
  
  if (cart.length === 0) {
    area.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
        <h3 style="color: #666;">Your cart is empty</h3>
        <p style="color: #999;">Add some delicious items to get started!</p>
        <a href="index.html#menu" style="display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 1rem;">Browse Menu</a>
      </div>
    `;
  } else {
    let total = 0;
    let html = '<div class="cart-items">';
    
    cart.forEach(item => {
      const itemTotal = item.qty * (item.type === 'home' ? item.pricePerKg : item.price);
      total += itemTotal;
      
      html += `
        <div class="cart-item" style="display: flex; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e1e1e1;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 0.5rem 0; color: #2c3e50;">${item.name}</h4>
            <p style="margin: 0; color: #7f8c8d; font-size: 0.9rem;">${item.desc || (item.kind || '')}</p>
            <p style="margin: 0.5rem 0 0 0; color: #3498db; font-weight: bold;">
              ${item.type === 'home' ? '₹' + item.pricePerKg + '/kg' : '₹' + item.price + ' / jar'} x ${item.qty}
            </p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold; color: #2c3e50;">₹${itemTotal}</p>
            <button onclick="removeFromCart('${item.id}', '${item.type}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">Remove</button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    html += `
      <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e1e1e1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: #2c3e50;">Total: ₹${total}</h3>
          <button onclick="clearCart()" style="background: #95a5a6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Clear Cart</button>
        </div>
        <a href="checkout.html" style="display: block; width: 100%; background: #27ae60; color: white; text-align: center; padding: 15px; text-decoration: none; border-radius: 6px; font-weight: bold;">Proceed to Checkout</a>
      </div>
    `;
    
    area.innerHTML = html;
  }
  
  // Update cart count
  const cartCount = $('#cartCount');
  if (cartCount) {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  }
}

function removeFromCart(id, type) {
  cart = cart.filter(item => !(item.id === id && item.type === type));
  renderCart();
}

function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    cart = [];
    renderCart();
  }
}

function buildOrderPayload(form) {
  const data = {
    customer: {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      payment: form.payment.value,
      upiId: form.upiId ? form.upiId.value.trim() : null
    },
    items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, unit: i.unit, unitPrice: i.unitPrice, lineTotal: i.qty * i.unitPrice })),
    total: cart.reduce((s,i)=>s + i.qty * i.unitPrice, 0),
    createdAt: new Date().toISOString()
  };
  return data;
}

function buildWhatsAppText(payload) {
  const lines = [];
  lines.push('New order from ' + (payload.customer.name || 'Customer'));
  if (payload.customer.phone) lines.push('Phone: ' + payload.customer.phone);
  if (payload.customer.address) lines.push('Address: ' + payload.customer.address);
  lines.push('');
  lines.push('Items:');
  payload.items.forEach(it => lines.push('- ' + it.name + ' — ' + it.qty + ' ' + it.unit + ' — ₹' + it.lineTotal.toFixed(0)));
  lines.push('');
  lines.push('Total: ₹' + payload.total.toFixed(0));
  lines.push('Payment: ' + (payload.customer.payment || 'N/A'));
  if (payload.customer.upiId) lines.push('UPI ID: ' + payload.customer.upiId);
  if (payload.customer.payment === 'QR Code') lines.push('Please scan the QR code provided on the website for payment.');
  return encodeURIComponent(lines.join('\n'));
}

function buildReceiptHTML(payload) {
  let html = '<p><strong>Payment Receipt - Sridevi Home Foods</strong></p>';
  html += '<p>Customer: ' + (payload.customer.name || 'Customer') + '</p>';
  if (payload.customer.phone) html += '<p>Phone: ' + payload.customer.phone + '</p>';
  if (payload.customer.address) html += '<p>Address: ' + payload.customer.address + '</p>';
  html += '<p>Items:</p><ul>';
  payload.items.forEach(it => html += '<li>' + it.name + ' — ' + it.qty + ' ' + it.unit + ' — ₹' + it.lineTotal.toFixed(0) + '</li>');
  html += '</ul>';
  html += '<p><strong>Total Paid: ₹' + payload.total.toFixed(0) + '</strong></p>';
  html += '<p>Payment Method: ' + (payload.customer.payment || 'N/A') + '</p>';
  if (payload.customer.upiId) html += '<p>UPI ID: ' + payload.customer.upiId + '</p>';
  if (payload.customer.payment === 'QR Code') html += '<p>Please scan the QR code on the website for payment.</p>';
  html += '<p>Order Date: ' + new Date(payload.createdAt).toLocaleString() + '</p>';
  html += '<p>Thank you for your payment! Your order will be processed soon.</p>';
  return html;
}

function sendToWhatsApp(payload) {
  if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER.length < 6) {
    alert('WhatsApp number not configured in app.js');
    return;
  }
  const text = buildWhatsAppText(payload);
  const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;
  window.open(url, '_blank');

  // Show receipt
  const receiptDiv = $('#receipt');
  const receiptContent = $('#receiptContent');
  if (receiptDiv && receiptContent) {
    receiptContent.innerHTML = buildReceiptHTML(payload);
    receiptDiv.style.display = 'block';
  }

  // Send payment receipt to customer if online payment
  if (payload.customer.payment === 'UPI' || payload.customer.payment === 'QR Code') {
    setTimeout(() => {
      sendReceiptToCustomer(payload);
    }, 2000); // delay to avoid multiple tabs
  }
}

function sendReceiptToWhatsApp(payload) {
  const customerPhone = payload.customer.phone.replace(/\D/g, ''); // remove non-digits
  if (!customerPhone || customerPhone.length < 10) {
    alert('Invalid customer phone number.');
    return;
  }
  const text = buildReceiptWhatsAppText(payload);
  const url = 'https://wa.me/91' + customerPhone + '?text=' + text; // assuming India +91
  window.open(url, '_blank');
  alert('Receipt sent to customer via WhatsApp.');
}

function buildReceiptWhatsAppText(payload) {
  const lines = [];
  lines.push('Payment Receipt');
  lines.push('Customer: ' + (payload.customer.name || 'N/A'));
  lines.push('Order Details: ' + payload.details);
  lines.push('Total Paid: ₹' + payload.total.toFixed(0));
  lines.push('Payment Method: ' + (payload.customer.payment || 'N/A'));
  lines.push('Date: ' + new Date(payload.createdAt).toLocaleString());
  lines.push('Thank you for your payment!');
  return encodeURIComponent(lines.join('\n'));
}

function sendReceiptToCustomer(payload) {
  const customerPhone = payload.customer.phone.replace(/\D/g, ''); // remove non-digits
  if (!customerPhone || customerPhone.length < 10) {
    console.warn('Invalid customer phone number for receipt.');
    return;
  }
  const text = buildPaymentReceiptText(payload);
  const url = 'https://wa.me/91' + customerPhone + '?text=' + text; // assuming India +91
  window.open(url, '_blank');
}

function buildPaymentReceiptText(payload) {
  const lines = [];
  lines.push('Payment Receipt - Sridevi Home Foods');
  lines.push('Customer: ' + (payload.customer.name || 'N/A'));
  lines.push('Order Details:');
  payload.items.forEach(it => lines.push('- ' + it.name + ' — ' + it.qty + ' ' + it.unit + ' — ₹' + it.lineTotal.toFixed(0)));
  lines.push('Total Paid: ₹' + payload.total.toFixed(0));
  lines.push('Payment Method: ' + (payload.customer.payment || 'N/A'));
  if (payload.customer.upiId) lines.push('UPI ID: ' + payload.customer.upiId);
  lines.push('Date: ' + new Date(payload.createdAt).toLocaleString());
  lines.push('Thank you for your payment! Your order will be processed soon.');
  return encodeURIComponent(lines.join('\n'));
}

// ===== ADMIN PANEL FUNCTIONS =====

function saveToLocalStorage() {
  localStorage.setItem('HOME_FOODS', JSON.stringify(HOME_FOODS));
  localStorage.setItem('PICKLES', JSON.stringify(PICKLES));
}

// Save menu to Firebase Realtime Database (if initialized)
function saveMenuToFirebase() {
  try {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    // only write if signed in
    if (!firebase.auth || !firebase.auth().currentUser) {
      console.warn('Not signed in — skipping Firebase save');
      return;
    }
    firebase.database().ref('menu').set({ home: HOME_FOODS, pickles: PICKLES });
  } catch (e) {
    console.warn('Failed to save menu to Firebase', e);
  }
}

// Watch menu in Firebase and update UI for all visitors
function watchMenuFromFirebase() {
  try {
    if (typeof firebase === 'undefined' || !firebase.database) return;
    const ref = firebase.database().ref('menu');
    ref.on('value', (snap) => {
      const data = snap.val();
      if (data) {
        HOME_FOODS = data.home || DEFAULT_HOME_FOODS;
        PICKLES = data.pickles || DEFAULT_PICKLES;
        // persist locally too
        localStorage.setItem('HOME_FOODS', JSON.stringify(HOME_FOODS));
        localStorage.setItem('PICKLES', JSON.stringify(PICKLES));
        renderCatalog();
      }
    });
  } catch (e) {
    console.warn('Failed to watch menu from Firebase', e);
  }
}

function resetToDefaults() {
  if (confirm('Reset all products to default menu? This cannot be undone.')) {
    HOME_FOODS = JSON.parse(JSON.stringify(DEFAULT_HOME_FOODS));
    PICKLES = JSON.parse(JSON.stringify(DEFAULT_PICKLES));
    localStorage.removeItem('HOME_FOODS');
    localStorage.removeItem('PICKLES');
    renderCatalog();
    renderAdminPanel();
    try { saveMenuToFirebase(); } catch(e) {}
    alert('Menu reset to defaults');
  }
}

function renderAdminPanel() {
  const adminList = $('#adminProductList');
  if (!adminList) return;
  adminList.innerHTML = '';

  const addHomeBtn = document.createElement('button');
  addHomeBtn.className = 'btn btn-sm btn-outline-primary mb-3';
  addHomeBtn.textContent = '+ Add Home Food';
  addHomeBtn.type = 'button';
  addHomeBtn.onclick = () => {
    const newId = 'item_' + Date.now();
    HOME_FOODS.push({ id: newId, name: 'New Item', pricePerKg: 100, desc: '', image: 'images/' });
    saveToLocalStorage(); saveMenuToFirebase();
    renderAdminPanel();
    renderCatalog();
  };
  adminList.appendChild(addHomeBtn);

  const addPickleBtn = document.createElement('button');
  addPickleBtn.className = 'btn btn-sm btn-outline-success mb-3 ms-2';
  addPickleBtn.textContent = '+ Add Pickle';
  addPickleBtn.type = 'button';
  addPickleBtn.onclick = () => {
    const newId = 'pickle_' + Date.now();
    PICKLES.push({ id: newId, name: 'New Pickle', price: 100, kind: 'veg', image: 'images/' });
    saveToLocalStorage(); saveMenuToFirebase();
    renderAdminPanel();
    renderCatalog();
  };
  adminList.appendChild(addPickleBtn);

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-sm btn-outline-danger mb-3 ms-2';
  resetBtn.textContent = 'Reset to Defaults';
  resetBtn.type = 'button';
  resetBtn.onclick = resetToDefaults;
  adminList.appendChild(resetBtn);

  adminList.appendChild(document.createElement('hr'));

  const homeTitle = document.createElement('h6');
  homeTitle.textContent = 'Home Foods';
  homeTitle.className = 'mt-4 mb-3';
  adminList.appendChild(homeTitle);

  HOME_FOODS.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'admin-product-row mb-3 p-3 border rounded';
    
    const nameVal = (item.name || '').replace(/"/g, '&quot;');
    const descVal = (item.desc || '').replace(/"/g, '&quot;');
    const imgVal = (item.image || '').replace(/"/g, '&quot;');
    
    row.innerHTML = '<div class="row g-2"><div class="col-md-3"><label class="form-label form-label-sm">Name</label><input type="text" class="form-control form-control-sm home-name" value="' + nameVal + '"></div><div class="col-md-2"><label class="form-label form-label-sm">Price/kg</label><input type="number" class="form-control form-control-sm home-price" value="' + item.pricePerKg + '"></div><div class="col-md-3"><label class="form-label form-label-sm">Description</label><input type="text" class="form-control form-control-sm home-desc" value="' + descVal + '"></div><div class="col-md-2"><label class="form-label form-label-sm">Image Path</label><input type="text" class="form-control form-control-sm home-image" value="' + imgVal + '"></div><div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-danger home-delete" type="button">Delete</button></div></div>';
    
    const nameInput = row.querySelector('.home-name');
    const priceInput = row.querySelector('.home-price');
    const descInput = row.querySelector('.home-desc');
    const imageInput = row.querySelector('.home-image');
    const deleteBtn = row.querySelector('.home-delete');

    // disable inputs if not signed in
    const signedIn = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
    if (!signedIn) {
      nameInput.disabled = true; priceInput.disabled = true; descInput.disabled = true; imageInput.disabled = true; deleteBtn.disabled = true;
    }

    nameInput.onchange = (e) => { HOME_FOODS[idx].name = e.target.value; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    priceInput.onchange = (e) => { HOME_FOODS[idx].pricePerKg = parseFloat(e.target.value) || 0; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    descInput.onchange = (e) => { HOME_FOODS[idx].desc = e.target.value; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    imageInput.onchange = (e) => { HOME_FOODS[idx].image = e.target.value; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    deleteBtn.onclick = () => {
      if (confirm('Delete "' + item.name + '"?')) {
        HOME_FOODS.splice(idx, 1);
        saveToLocalStorage(); saveMenuToFirebase();
        renderAdminPanel();
        renderCatalog();
      }
    };

    adminList.appendChild(row);
  });

  const pickleTitle = document.createElement('h6');
  pickleTitle.textContent = 'Pickles';
  pickleTitle.className = 'mt-4 mb-3';
  adminList.appendChild(pickleTitle);

  PICKLES.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'admin-product-row mb-3 p-3 border rounded';
    
    const nameVal = (item.name || '').replace(/"/g, '&quot;');
    const imgVal = (item.image || '').replace(/"/g, '&quot;');
    
    row.innerHTML = '<div class="row g-2"><div class="col-md-2"><label class="form-label form-label-sm">Name</label><input type="text" class="form-control form-control-sm pickle-name" value="' + nameVal + '"></div><div class="col-md-2"><label class="form-label form-label-sm">Price</label><input type="number" class="form-control form-control-sm pickle-price" value="' + item.price + '"></div><div class="col-md-2"><label class="form-label form-label-sm">Kind</label><select class="form-select form-select-sm pickle-kind"><option value="veg" ' + (item.kind === 'veg' ? 'selected' : '') + '>Veg</option><option value="non-veg" ' + (item.kind === 'non-veg' ? 'selected' : '') + '>Non-veg</option></select></div><div class="col-md-2"><label class="form-label form-label-sm">Image Path</label><input type="text" class="form-control form-control-sm pickle-image" value="' + imgVal + '"></div><div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-danger pickle-delete" type="button">Delete</button></div></div>';
    
    const nameInput = row.querySelector('.pickle-name');
    const priceInput = row.querySelector('.pickle-price');
    const kindInput = row.querySelector('.pickle-kind');
    const imageInput = row.querySelector('.pickle-image');
    const deleteBtn = row.querySelector('.pickle-delete');

    // disable inputs if not signed in
    const signedInP = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
    if (!signedInP) {
      nameInput.disabled = true; priceInput.disabled = true; kindInput.disabled = true; imageInput.disabled = true; deleteBtn.disabled = true;
    }

    nameInput.onchange = (e) => { PICKLES[idx].name = e.target.value; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    priceInput.onchange = (e) => { PICKLES[idx].price = parseFloat(e.target.value) || 0; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    kindInput.onchange = (e) => { PICKLES[idx].kind = e.target.value; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    imageInput.onchange = (e) => { PICKLES[idx].image = e.target.value; saveToLocalStorage(); saveMenuToFirebase(); renderCatalog(); };
    deleteBtn.onclick = () => {
      if (confirm('Delete "' + item.name + '"?')) {
        PICKLES.splice(idx, 1);
        saveToLocalStorage(); saveMenuToFirebase();
        renderAdminPanel();
        renderCatalog();
      }
    };

    adminList.appendChild(row);
  });
}

// Admin Panel Logic (admin.html only)
function renderAdminProductList() {
  const adminProductList = document.getElementById("adminProductList");
  adminProductList.innerHTML = '';
  const allProducts = [...HOME_FOODS.map((p, i) => ({...p, type: 'home', idx: i})), ...PICKLES.map((p, i) => ({...p, type: 'pickle', idx: i + HOME_FOODS.length}))];
  allProducts.forEach((product) => {
    const row = document.createElement('div');
    row.className = 'admin-product-row p-2 mb-2 border rounded';
    row.innerHTML = `
      <div class="row g-2 align-items-center">
        <div class="col-md-3">
          <input type="text" class="form-control form-control-sm" value="${product.name}" data-idx="${product.idx}" data-type="${product.type}" data-field="name">
        </div>
        <div class="col-md-2">
          <input type="number" class="form-control form-control-sm" value="${product.type === 'home' ? product.pricePerKg : product.price}" data-idx="${product.idx}" data-type="${product.type}" data-field="price">
        </div>
        <div class="col-md-3">
          <input type="text" class="form-control form-control-sm" value="${product.desc || ''}" data-idx="${product.idx}" data-type="${product.type}" data-field="desc">
        </div>
        <div class="col-md-2">
          <button class="btn btn-sm btn-success saveProductBtn" data-idx="${product.idx}" data-type="${product.type}">Save</button>
        </div>
        <div class="col-md-2">
          <button class="btn btn-sm btn-danger deleteProductBtn" data-idx="${product.idx}" data-type="${product.type}">Delete</button>
        </div>
      </div>
    `;
    adminProductList.appendChild(row);
  });
}

function saveProduct(idx, type) {
  const name = document.querySelector(`input[data-idx='${idx}'][data-type='${type}'][data-field='name']`).value;
  const price = document.querySelector(`input[data-idx='${idx}'][data-type='${type}'][data-field='price']`).value;
  const desc = document.querySelector(`input[data-idx='${idx}'][data-type='${type}'][data-field='desc']`).value;
  if (type === 'home') {
    HOME_FOODS[idx].name = name;
    HOME_FOODS[idx].pricePerKg = Number(price);
    HOME_FOODS[idx].desc = desc;
  } else {
    const pickleIdx = idx - HOME_FOODS.length;
    PICKLES[pickleIdx].name = name;
    PICKLES[pickleIdx].price = Number(price);
    PICKLES[pickleIdx].desc = desc;
  }
  saveMenuToLocalStorage();
  renderAdminProductList();
}

function deleteProduct(idx, type) {
  if (type === 'home') {
    HOME_FOODS.splice(idx, 1);
  } else {
    const pickleIdx = idx - HOME_FOODS.length;
    PICKLES.splice(pickleIdx, 1);
  }
  saveMenuToLocalStorage();
  renderAdminProductList();
}

function addProduct() {
  // Default new product
  HOME_FOODS.push({ id: 'new' + Date.now(), name: 'New Food', pricePerKg: 300, desc: '' });
  saveMenuToLocalStorage();
  renderAdminProductList();
}

function saveMenuToLocalStorage() {
  localStorage.setItem('HOME_FOODS', JSON.stringify(HOME_FOODS));
  localStorage.setItem('PICKLES', JSON.stringify(PICKLES));
}

function loadMenuFromLocalStorage() {
  const homeFoods = localStorage.getItem('HOME_FOODS');
  const pickles = localStorage.getItem('PICKLES');
  if (homeFoods) {
    try { HOME_FOODS = JSON.parse(homeFoods); } catch {}
  }
  if (pickles) {
    try { PICKLES = JSON.parse(pickles); } catch {}
  }
}

document.addEventListener('DOMContentLoaded', function() {
  renderCatalog();
  renderCart();
  // Start watching menu updates from Firebase (if configured)
  try {
    if (typeof firebase !== 'undefined' && firebase.database) {
      watchMenuFromFirebase();
    }
  } catch (e) {}
  
  // Payment method details toggle
  const paymentSelect = $('#paymentSelect');
  if (paymentSelect) {
    paymentSelect.addEventListener('change', () => {
      const details = $('#paymentDetails');
      const upi = $('#upiDetails');
      const qr = $('#qrDetails');
      const val = paymentSelect.value;
      if (val === 'UPI') {
        details.style.display = 'block';
        upi.style.display = 'block';
        qr.style.display = 'none';
      } else if (val === 'QR Code') {
        details.style.display = 'block';
        upi.style.display = 'none';
        qr.style.display = 'block';
      } else {
        details.style.display = 'none';
        upi.style.display = 'none';
        qr.style.display = 'none';
      }
    });
  }

  // Close receipt button
  const closeReceipt = $('#closeReceipt');
  if (closeReceipt) {
    closeReceipt.addEventListener('click', () => {
      $('#receipt').style.display = 'none';
    });
  }
  // Check if admin parameter exists in URL
  const params = new URLSearchParams(window.location.search);
  const isAdmin = params.get('admin') === '050697';
  
  if (isAdmin) {
    $('#toggleAdminBtn').style.display = 'inline-block';
  }
  
  let adminInitialized = false;
  
  $('#toggleAdminBtn').addEventListener('click', () => {
    if (!adminInitialized) {
      renderAdminPanel();
      adminInitialized = true;
    }
    
    const panel = $('#adminPanel');
    if (!panel) {
      alert('Admin panel not found in DOM');
      return;
    }
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    if (isHidden) {
      panel.style.display = 'block';
      $('#toggleAdminBtn').textContent = 'Hide Admin Panel';
    } else {
      panel.style.display = 'none';
      $('#toggleAdminBtn').textContent = 'Show Admin Panel';
    }
  });

  // Firebase Auth: sign-in UI and state handling (if SDK loaded)
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const signed = $('#adminSignedIn');
          const form = $('#adminSignInForm');
          if (signed) signed.style.display = 'inline-block';
          if (form) form.style.display = 'none';
          const disp = $('#adminEmailDisplay'); if (disp) disp.textContent = user.email;
          const out = $('#adminSignOutBtn'); if (out) out.onclick = () => firebase.auth().signOut();
        } else {
          const signed = $('#adminSignedIn');
          const form = $('#adminSignInForm');
          if (signed) signed.style.display = 'none';
          if (form) form.style.display = 'block';
          const disp = $('#adminEmailDisplay'); if (disp) disp.textContent = '';
        }
        if (adminInitialized) renderAdminPanel();
      });

      const sendReceiptBtn = $('#sendReceiptBtn');
      if (sendReceiptBtn) {
        sendReceiptBtn.addEventListener('click', () => {
          const name = ($('#receiptName').value || '').trim();
          const phone = ($('#receiptPhone').value || '').trim();
          const details = ($('#receiptDetails').value || '').trim();
          const total = parseFloat($('#receiptTotal').value || 0);
          const payment = $('#receiptPayment').value;
          if (!name || !phone || !details || total <= 0) {
            alert('Please fill all fields with valid data.');
            return;
          }
          const receiptPayload = {
            customer: { name, phone, payment },
            items: [{ name: 'Order Items', qty: 1, unit: '', lineTotal: total }],
            total,
            details,
            createdAt: new Date().toISOString()
          };
          sendReceiptToWhatsApp(receiptPayload);
        });
      }
    }
  } catch (e) { console.warn('Auth init failed', e); }

  $('#sendWhatsApp').addEventListener('click', () => {
    const form = $('#orderForm');
    if (!form.name.value.trim() || !form.phone.value.trim() || !form.address.value.trim()) {
      alert('Please fill name, phone and address.');
      return;
    }
    if (cart.length === 0) { alert('Cart is empty'); return; }
    const payload = buildOrderPayload(form);
    sendToWhatsApp(payload);
  });

  $('#openCartBtn').addEventListener('click', () => {
    window.scrollTo({ top: document.querySelector('main').offsetTop, behavior: 'smooth' });
  });

  $('#whatsappGuideBtn').addEventListener('click', () => {
    alert('WhatsApp will open in a new tab (WhatsApp Web) or the mobile app; you must press SEND to complete the message.');
  });

  // Admin panel logic (admin.html only)
  if (location.pathname.endsWith('admin.html')) {
    loadMenuFromLocalStorage();
    renderAdminProductList();
    const addBtn = document.getElementById("addProductBtn");
    if (addBtn) addBtn.onclick = addProduct;
    document.getElementById("adminProductList").addEventListener('click', function(e) {
      if (e.target.classList.contains('saveProductBtn')) {
        const idx = Number(e.target.dataset.idx);
        const type = e.target.dataset.type;
        saveProduct(idx, type);
      }
      if (e.target.classList.contains('deleteProductBtn')) {
        const idx = Number(e.target.dataset.idx);
        const type = e.target.dataset.type;
        deleteProduct(idx, type);
      }
    });

    // Admin Sign In Button (admin.html only)
    const signInBtn = document.getElementById('adminSignInBtn');
    if (signInBtn && typeof firebase !== 'undefined' && firebase.auth) {
      signInBtn.onclick = function() {
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        if (!email || !password) {
          alert('Please enter both email and password.');
          return;
        }
        firebase.auth().signInWithEmailAndPassword(email, password)
          .then(() => {
            // Success: UI will update via onAuthStateChanged
          })
          .catch(err => {
            alert('Sign in failed: ' + (err.message || err));
          });
      };
    }
  }
});
