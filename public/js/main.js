if (!window.socket) {
  window.socket = io();
  console.log("📡 Socket inicializado");
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔄 DOMContentLoaded disparado");

  const productList = document.getElementById("product-list");
  const categoryFilter = document.getElementById("category-filter");
  const cartId = "1234";

  let allProducts = [];

  console.log("🔍 Buscando elementos:");
  console.log("🔎 product-list:", productList);
  console.log("🔎 category-filter:", categoryFilter);

  if (!productList || !categoryFilter) {
    if (!productList) console.warn("❌ No se encontró el elemento 'product-list'");
    if (!categoryFilter) console.warn("❌ No se encontró el elemento 'category-filter'");
    console.warn("🚫 Saliendo del script: esta vista no requiere manejo de productos.");
    return;
  }

  async function fetchProducts() {
    console.log("📥 Fetching productos...");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      console.log("📦 Productos recibidos del servidor:", data);

      allProducts = data.payload || [];

      renderCategoryOptions();
      renderProducts(allProducts);
    } catch (error) {
      console.error("💥 Error al obtener productos:", error);
      productList.innerHTML = `<p class="text-center text-red-500">No se pudieron cargar los productos.</p>`;
    }
  }

  function renderProducts(products) {
    console.log("🎨 Renderizando productos:", products);
    productList.innerHTML = "";

    if (!products.length) {
      productList.innerHTML = `<p class="text-center text-gray-500">No se encontraron productos.</p>`;
      return;
    }

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between";

      productCard.innerHTML = `
        <div>
          <h3 class="text-lg font-semibold text-gray-800">${product.title}</h3>
          <p class="text-sm text-gray-500">${product.description}</p>
          <p class="text-xs text-gray-400">Categoría: ${product.category}</p>
        </div>
        <div class="mt-4 flex justify-between items-center">
          <span class="text-green-600 font-bold">$${product.price}</span>
          <button 
            class="add-to-cart bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl text-sm transition"
            data-id="${product._id}"
          >
            Agregar al carrito
          </button>
          <button 
            class="delete-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl text-sm transition ml-2"
            data-id="${product._id}"
          >
            Eliminar
          </button>
        </div>
      `;

      productList.appendChild(productCard);
    });
  }

  function renderCategoryOptions() {
    const categories = [...new Set(allProducts.map((p) => p.category))];
    console.log("📁 Categorías para filtro:", categories);

    categoryFilter.innerHTML = `
      <option value="all">Todas</option>
      ${categories
        .map((cat) => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`)
        .join("")}
    `;
  }

  categoryFilter.addEventListener("change", (e) => {
    const selected = e.target.value;
    console.log("🔄 Filtro aplicado:", selected);

    if (selected === "all") {
      renderProducts(allProducts);
    } else {
      const filtered = allProducts.filter((p) => p.category === selected);
      renderProducts(filtered);
    }
  });

  productList.addEventListener("click", async (e) => {
    const target = e.target;

    if (target.classList.contains("add-to-cart")) {
      const productId = target.dataset.id;
      console.log("🛒 Agregar al carrito:", productId);

      try {
        const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
          method: "POST",
        });
        if (res.ok) {
          Swal.fire({
            title: "Producto agregado",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          const err = await res.json();
          Swal.fire({
            title: "Error",
            text: err.message || "No se pudo agregar el producto",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("💥 Error al agregar al carrito:", error);
        Swal.fire({
          title: "Error",
          text: "Error de red al agregar producto.",
          icon: "error",
        });
      }
    } else if (target.classList.contains("delete-btn")) {
      const productId = target.dataset.id;
      console.log("🗑️ Eliminar producto:", productId);

      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          allProducts = allProducts.filter(p => p._id !== productId);
          renderCategoryOptions();
          const selected = categoryFilter.value;
          const filtered = selected && selected !== "all"
            ? allProducts.filter(p => p.category === selected)
            : allProducts;
          renderProducts(filtered);
        } else {
          const err = await res.json();
          throw err;
        }
      } catch (err) {
        console.error("💥 Error al eliminar producto:", err);
        Swal.fire({
          title: "Error",
          text: err.message || "No se pudo eliminar el producto",
          icon: "error",
        });
      }
    }
  });

  socket.on("update-products", (updatedProducts) => {
    console.log("🔁 Productos actualizados vía socket:", updatedProducts);
    allProducts = updatedProducts;
    renderCategoryOptions();

    const selected = categoryFilter.value;
    const filtered = selected && selected !== "all"
      ? allProducts.filter(p => p.category === selected)
      : allProducts;

    renderProducts(filtered);
  });

  await fetchProducts();
});