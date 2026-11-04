
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [customer, setCustomer] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // ==========================================
  // FETCH PRODUCTS FROM BACKEND
  // ==========================================

  useEffect(() => {
    fetch("/api/shop/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setOrderMessage("");
    setLastOrder(null);
  };

  // ==========================================
  // UPDATE CART QUANTITY
  // ==========================================

  const updateQuantity = (id, change) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    setOrderMessage("");
    setLastOrder(null);
  };

  // ==========================================
  // SEARCH AND CATEGORY FILTERING
  // ==========================================

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  // ==========================================
  // CART CALCULATIONS
  // ==========================================

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const placeOrder = async () => {
    if (!customer.trim()) {
      setOrderMessage("Please enter your name.");
      return;
    }

    if (cart.length === 0) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    setPlacingOrder(true);
    setOrderMessage("");

    try {
      const response = await fetch("/api/shop/orders",{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer: customer.trim(),
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order placement failed");
      }

      setLastOrder(data.order);

      setOrderMessage(
        `Order #${data.order.id} placed successfully!`
      );

      setCart([]);
      setCustomer("");
    } catch (err) {
      setOrderMessage(err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // USER INTERFACE
  // ==========================================

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">
        <h1>
          ShopSphere<span>.</span>
        </h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cart-indicator">
          🛒 Cart ({cartCount})
        </div>
      </header>

      {/* HERO SECTION */}

      <section className="hero">
        <div>
          <p className="eyebrow">
            YOUR EVERYDAY MARKETPLACE
          </p>

          <h2>
            Find what you love.
            <br />
            Shop what you need.
          </h2>

         <p>
  Discover quality products at great prices.
</p>

<p className="release-label">
  Deployment Release v3
</p>

          <a href="#products" className="shop-button">
            Explore Products
          </a>
        </div>
      </section>

      {/* PRODUCTS SECTION */}

      <main className="main-content" id="products">

        <div className="section-heading">
          <div>
            <p className="eyebrow">OUR COLLECTION</p>
            <h2>Featured Products</h2>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        {/* LOADING STATE */}

        {loading && (
          <p>Loading products...</p>
        )}

        {/* ERROR STATE */}

        {error && (
          <p className="empty-message">
            {error}
          </p>
        )}

        {/* PRODUCT GRID */}

        {!loading && !error && (
          <>
            <div className="product-grid">

              {filteredProducts.map((product) => (
                <article
                  className="product-card"
                  key={product.id}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div className="product-info">

                    <p className="category">
                      {product.category}
                    </p>

                    <h3>{product.name}</h3>

                    <p className="rating">
                      ★ {product.rating}
                    </p>

                    <div className="product-bottom">

                      <strong>
                        ₹{product.price.toLocaleString("en-IN")}
                      </strong>

                      <button
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>

                    </div>
                  </div>
                </article>
              ))}

            </div>

            {/* NO PRODUCTS FOUND */}

            {filteredProducts.length === 0 && (
              <p className="empty-message">
                No products found.
              </p>
            )}
          </>
        )}

      </main>

      {/* SHOPPING CART */}

      <section className="cart-section">

        <h2>Your Shopping Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is currently empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                className="cart-item"
                key={item.id}
              >

                <span>{item.name}</span>

                <div>
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={placingOrder}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={placingOrder}
                  >
                    +
                  </button>
                </div>

                <strong>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </strong>

              </div>
            ))}

            {/* CART TOTAL */}

            <h3 className="cart-total">
              Total: ₹{cartTotal.toLocaleString("en-IN")}
            </h3>

            {/* CUSTOMER DETAILS */}

            <input
              type="text"
              placeholder="Enter your name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              disabled={placingOrder}
            />

            {/* CHECKOUT BUTTON */}

            <button
              className="checkout-button"
              onClick={placeOrder}
              disabled={placingOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </>
        )}

        {/* ORDER MESSAGE */}

        {orderMessage && (
          <p style={{ marginTop: "20px" }}>
            {orderMessage}
          </p>
        )}

        {/* ORDER CONFIRMATION */}

        {lastOrder && (
          <div style={{ marginTop: "15px" }}>
            <h3>Order Confirmation</h3>

            <p>
              Order ID: #{lastOrder.id}
            </p>

            <p>
              Customer: {lastOrder.customer}
            </p>

            <p>
              Order Total: ₹{lastOrder.total.toLocaleString("en-IN")}
            </p>

            <p>
              Status: {lastOrder.status}
            </p>
          </div>
        )}

      </section>

      {/* FOOTER */}

      <footer>
        <p>
          © 2026 ShopSphere. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default App;
