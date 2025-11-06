document.addEventListener("DOMContentLoaded", () => {

  // ===== SLIDER =====
  const slides = document.querySelectorAll(".slider-item .item");
  let index = 0;
  const duration = 4000;

  function slide() {
    slides.forEach(slide => slide.classList.remove("active"));
    if (slides[index]) slides[index].classList.add("active");
    index = (index + 1) % slides.length;
  }

  slide();
  setInterval(slide, duration);

  // ===== MODALS =====
  let currentModal = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      currentModal = modal;
      if (!history.state || !history.state.modalOpen) {
        history.pushState({ modalOpen: true }, '');
      }
    }
  }

  function closeModal(modalId = null) {
    const modal = modalId ? document.getElementById(modalId) : currentModal;
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
      currentModal = null;
      if (history.state && history.state.modalOpen) history.back();
    }
  }

  // ===== کلیک روی menu-item و fried-item =====
  document.querySelectorAll('.menu-item, .fried-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const type = this.dataset.menu || this.dataset.fried;
      if (type) openModal(`menu_${type}Modal`);
    });
  });

  // ===== کلیک روی ضربدر =====
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function () {
      const modal = this.closest('.menu-modal');
      if (modal) closeModal(modal.id);
    });
  });

  // ===== کلیک خارج modal =====
  window.addEventListener('click', (e) => {
    if (currentModal && e.target === currentModal) closeModal();
  });

  // ===== دکمه Back =====
  window.addEventListener('popstate', () => {
    if (currentModal) closeModal();
  });

  // ===== CART =====
  let cart = JSON.parse(localStorage.getItem("cart") || "{}") || {};

  function updateFloatingCart() {
    if (!cart) cart = {};
    const cartItemsEl = document.getElementById("cart-items");
    const cartTotalEl = document.getElementById("cart-total");
    const cartCountEl = document.getElementById("cart-count");
    const cartTotalPriceEl = document.getElementById("cart-total-price");

    if (!cartItemsEl || !cartTotalEl || !cartCountEl) return;

    cartItemsEl.innerHTML = "";
    let total = 0;
    let count = 0;

    Object.keys(cart).forEach(key => {
      const item = cart[key];
      if (item && item.quantity > 0) {
        total += item.quantity * item.price;
        count += item.quantity;
        const li = document.createElement("li");
        li.innerHTML = `${item.name} (${item.size}) - ${item.price} x ${item.quantity} <span class="remove-item" data-id="${key}">✕</span>`;
        cartItemsEl.appendChild(li);
      }
    });

    cartTotalEl.textContent = `جمع کل: ${total} تومان`;
    cartCountEl.textContent = count;
    if (cartTotalPriceEl) cartTotalPriceEl.textContent = total;

    // حذف آیتم
    document.querySelectorAll("#cart-items .remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if(cart[id]) cart[id].quantity = 0;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateFloatingCart();
        updateCartButtons();
      });
    });
  }

  function updateCartButtons() {
    document.querySelectorAll(".modal-grid .pizza-card").forEach(card => {
      const plusBtn = card.querySelector(".btn-plus");
      const minusBtn = card.querySelector(".btn-minus");
      const quantityText = card.querySelector(".quantity");
      const addText = card.querySelector(".add-text");
      if (plusBtn && minusBtn && quantityText && addText) {
        const nameEl = card.querySelector("h4");
        const name = nameEl ? nameEl.textContent.trim() : "محصول بدون نام";
        const priceList = card.querySelectorAll("ul.prices li");
        const selectedPriceEl = priceList[0] || card.querySelector("p");
        const idCard = name.replace(/\s+/g, "_").toLowerCase() + "_" +
                       (selectedPriceEl ? selectedPriceEl.textContent.split(':')[0].trim() : "default").replace(/\s+/g, "_").toLowerCase() + "_" +
                       (selectedPriceEl ? parseInt(selectedPriceEl.textContent.replace(/[^0-9]/g, '')) : 0);
        quantityText.textContent = cart[idCard] ? cart[idCard].quantity : 0;
        addText.textContent = cart[idCard] && cart[idCard].quantity > 0 ? "در سبد خرید" : "افزودن به سبد خرید";
        addText.style.color = cart[idCard] && cart[idCard].quantity > 0 ? "#4caf50" : "#ccc";
      }
    });
  }

  document.querySelectorAll(".modal-grid .pizza-card").forEach(card => {
    const control = card.querySelector(".cart-controls");
    if (!control) return;

    const plusBtn = control.querySelector(".btn-plus");
    const minusBtn = control.querySelector(".btn-minus");
    const quantityText = control.querySelector(".quantity");
    const addText = control.querySelector(".add-text");
    if (!plusBtn || !minusBtn || !quantityText || !addText) return;

    const nameEl = card.querySelector("h4");
    const name = nameEl ? nameEl.textContent.trim() : "محصول بدون نام";

    const priceList = card.querySelectorAll("ul.prices li");
    let selectedPriceEl = priceList[0] || card.querySelector("p");
    if (selectedPriceEl) selectedPriceEl.classList.add("active-price");

    function getPrice(el) {
      if (!el) return 0;
      const text = el.textContent.trim();
      const match = text.match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, '')) : 0;
    }

    function getSize(el) {
      if (!el) return "default";
      return el.dataset.size || el.textContent.split(':')[0].trim();
    }

    function getItemId() {
      const size = getSize(selectedPriceEl);
      const price = getPrice(selectedPriceEl);
      return name.replace(/\s+/g, "_").toLowerCase() + "_" + size.replace(/\s+/g, "_").toLowerCase() + "_" + price;
    }

    function updateAddText() {
      const id = getItemId();
      if (!(id in cart)) cart[id] = { quantity: 0, name, price: getPrice(selectedPriceEl), size: getSize(selectedPriceEl) };
      const quantity = cart[id].quantity;
      quantityText.textContent = quantity;
      addText.textContent = quantity > 0 ? "در سبد خرید" : "افزودن به سبد خرید";
      addText.style.color = quantity > 0 ? "#4caf50" : "#ccc";
      updateFloatingCart();
    }

    priceList.forEach(li => {
      li.addEventListener("click", () => {
        priceList.forEach(i => i.classList.remove("active-price"));
        li.classList.add("active-price");
        selectedPriceEl = li;
        updateAddText();
      });
    });

    plusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = getItemId();
      if (!(id in cart)) cart[id] = { quantity: 0, name, price: getPrice(selectedPriceEl), size: getSize(selectedPriceEl) };
      cart[id].quantity++;
      updateAddText();
      localStorage.setItem("cart", JSON.stringify(cart));
    });

    minusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = getItemId();
      if (cart[id] && cart[id].quantity > 0) {
        cart[id].quantity--;
        updateAddText();
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    });

    updateAddText();
  });

  // ===== نمایش سبد خرید =====
  const cartToggle = document.getElementById("floating-cart-toggle");
  const floatingCart = document.getElementById("floating-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const closeCartBtn = document.getElementById("close-cart");

  cartToggle.addEventListener("click", () => {
    floatingCart.style.display = (floatingCart.style.display === "block") ? "none" : "block";
  });

  closeCartBtn.addEventListener("click", () => {
    floatingCart.style.display = "none";
  });

  // ===== EmailJS =====
  emailjs.init('cSJ_PDk6BcGLg0178');

 checkoutBtn.addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");

  // فقط آیتم‌هایی که quantity > 0 هستند
  const filteredCart = Object.fromEntries(
    Object.entries(cart).filter(([key, item]) => item.quantity > 0)
  );

  if (Object.keys(filteredCart).length === 0) {
    alert("سبد خرید شما خالی است!");
    return;
  }

  let phone = "";
  const phoneRegex = /^09\d{9}$/; // شماره ایران: 11 رقم و با 09 شروع

  // حلقه تا وقتی شماره معتبر وارد شود
  while (!phoneRegex.test(phone)) {
    phone = prompt("لطفاً شماره تماس خود را به صورت صحیح وارد کنید (مثال: 09123456789):");
    if (phone === null) {
      alert("ارسال سفارش لغو شد.");
      return; // کاربر Cancel زده
    }
    if (!phoneRegex.test(phone)) alert("شماره وارد شده صحیح نیست، لطفاً دوباره وارد کنید.");
  }

  // تبدیل به رشته خوانا برای ایمیل
  const orderString = Object.values(filteredCart).map(item => {
    return `${item.name}\nتعداد: ${item.quantity}\nسایز: ${item.size}\nقیمت: ${item.price}\n`;
  }).join("\n");

  emailjs.send('service_ldi2akf', 'template_6y9qrhb', {
    order_details: orderString,
    total_price: Object.values(filteredCart).reduce((sum, item) => sum + (item.price * item.quantity), 0),
    customer_phone: phone
  })
  .then(() => {
    alert("سفارش شما ارسال شد!");
    // پاک کردن مقادیر ارسال شده
    Object.keys(filteredCart).forEach(key => cart[key].quantity = 0);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateFloatingCart();
    updateCartButtons();
  })
  .catch(err => console.error(err));
});


  updateFloatingCart();
  updateCartButtons();

  console.log("سبد خرید بارگذاری شد:", cart);
});
