import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = '/api';

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#0f1117',
    color: '#e0e0e0',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottom: '1px solid #2a2d3e',
    paddingBottom: '16px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '0.5px',
  },
  headerSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px',
  },
  badge: {
    marginLeft: '12px',
    backgroundColor: '#1a3a2a',
    color: '#34d399',
    fontSize: '11px',
    padding: '3px 10px',
    borderRadius: '12px',
    border: '1px solid #34d399',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#1a1d2e',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #2a2d3e',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
  },
  statSub: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  card: {
    backgroundColor: '#1a1d2e',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2a2d3e',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  input: {
    backgroundColor: '#0f1117',
    border: '1px solid #2a2d3e',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#e0e0e0',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    fontSize: '11px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    paddingBottom: '12px',
    borderBottom: '1px solid #2a2d3e',
  },
  td: {
    padding: '12px 0',
    fontSize: '14px',
    borderBottom: '1px solid #1e2130',
    color: '#e0e0e0',
  },
  stockBadge: (stock) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: stock > 5 ? '#1a3a2a' : '#3a1a1a',
    color: stock > 5 ? '#34d399' : '#f87171',
    border: `1px solid ${stock > 5 ? '#34d399' : '#f87171'}`,
  }),
  statusBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: '#1a2a3a',
    color: '#60a5fa',
    border: '1px solid #60a5fa',
  },
  error: {
    backgroundColor: '#3a1a1a',
    border: '1px solid #f87171',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '12px',
  },
  success: {
    backgroundColor: '#1a3a2a',
    border: '1px solid #34d399',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#34d399',
    fontSize: '13px',
    marginBottom: '12px',
  },
  divider: {
    borderBottom: '1px solid #2a2d3e',
    marginBottom: '20px',
  },
  refreshBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #2a2d3e',
    borderRadius: '8px',
    padding: '6px 14px',
    color: '#6b7280',
    fontSize: '12px',
    cursor: 'pointer',
    marginLeft: 'auto',
  }
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [newOrder, setNewOrder] = useState({ product_id: '', quantity: '' });
  const [productMsg, setProductMsg] = useState(null);
  const [orderMsg, setOrderMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [p, o] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/orders`),
      ]);
      setProducts(p.data);
      setOrders(o.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      setProductMsg({ type: 'error', text: 'All fields are required' });
      return;
    }
    try {
      await axios.post(`${API}/products`, {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
      });
      setNewProduct({ name: '', price: '', stock: '' });
      setProductMsg({ type: 'success', text: 'Product added successfully' });
      fetchData();
    } catch (err) {
      setProductMsg({ type: 'error', text: 'Failed to add product' });
    }
    setTimeout(() => setProductMsg(null), 3000);
  };

  const placeOrder = async () => {
    if (!newOrder.product_id || !newOrder.quantity) {
      setOrderMsg({ type: 'error', text: 'All fields are required' });
      return;
    }
    try {
      await axios.post(`${API}/orders`, {
        product_id: parseInt(newOrder.product_id),
        quantity: parseInt(newOrder.quantity),
      });
      setNewOrder({ product_id: '', quantity: '' });
      setOrderMsg({ type: 'success', text: 'Order placed — stock updating...' });
      setTimeout(fetchData, 1500);
    } catch (err) {
      setOrderMsg({ type: 'error', text: 'Failed to place order' });
    }
    setTimeout(() => setOrderMsg(null), 3000);
  };

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div style={styles.app}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>
            🛒 ECommerce Microservices Dashboard
          </div>
          <div style={styles.headerSubtitle}>
            Docker · Kubernetes · RabbitMQ · Nginx · PostgreSQL
          </div>
        </div>
        <span style={styles.badge}>● LIVE</span>
        <button style={styles.refreshBtn} onClick={fetchData}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Products</div>
          <div style={styles.statValue}>{products.length}</div>
          <div style={styles.statSub}>in catalog</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Orders</div>
          <div style={styles.statValue}>{orders.length}</div>
          <div style={styles.statSub}>{pendingOrders} pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Stock</div>
          <div style={styles.statValue}>{totalStock}</div>
          <div style={styles.statSub}>units available</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Services</div>
          <div style={styles.statValue}>6</div>
          <div style={styles.statSub}>containers running</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>

        {/* Products */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            📦 Products
          </div>

          {productMsg && (
            <div style={productMsg.type === 'error' ? styles.error : styles.success}>
              {productMsg.text}
            </div>
          )}

          <div style={styles.form}>
            <input
              style={styles.input}
              placeholder="Product name"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Price (e.g. 999.99)"
              value={newProduct.price}
              onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Stock quantity"
              value={newProduct.stock}
              onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
            <button style={styles.button} onClick={addProduct}>
              + Add Product
            </button>
          </div>

          <div style={styles.divider} />

          {loading ? (
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>#{p.id}</td>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>${parseFloat(p.price).toFixed(2)}</td>
                    <td style={styles.td}>
                      <span style={styles.stockBadge(p.stock)}>
                        {p.stock} units
                      </span>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td style={{ ...styles.td, color: '#6b7280' }} colSpan={4}>
                      No products yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Orders */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            🧾 Orders
          </div>

          {orderMsg && (
            <div style={orderMsg.type === 'error' ? styles.error : styles.success}>
              {orderMsg.text}
            </div>
          )}

          <div style={styles.form}>
            <select
              style={styles.input}
              value={newOrder.product_id}
              onChange={e => setNewOrder({ ...newOrder, product_id: e.target.value })}
            >
              <option value="">Select a product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.name} (stock: {p.stock})
                </option>
              ))}
            </select>
            <input
              style={styles.input}
              placeholder="Quantity"
              value={newOrder.quantity}
              onChange={e => setNewOrder({ ...newOrder, quantity: e.target.value })}
            />
            <button style={styles.button} onClick={placeOrder}>
              Place Order
            </button>
          </div>

          <div style={styles.divider} />

          {loading ? (
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={styles.td}>#{o.id}</td>
                    <td style={styles.td}>Product #{o.product_id}</td>
                    <td style={styles.td}>{o.quantity}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge}>{o.status}</span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td style={{ ...styles.td, color: '#6b7280' }} colSpan={4}>
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}