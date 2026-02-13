import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api.js';
import ProductForm from '../components/ProductForm.jsx';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Impossible de charger les produits');
    }
  }

  async function handleSave(productData) {
    try {
      if (editing) {
        await updateProduct(editing.id, productData);
      } else {
        await createProduct(productData);
      }
      setShowForm(false);
      setEditing(null);
      loadProducts();
    } catch (err) {
      setError(err.data?.detail || 'Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      setError(err.data?.detail || 'Erreur lors de la suppression');
    }
  }

  function openEdit(product) {
    setEditing(product);
    setShowForm(true);
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  return (
    <div>
      <div className="products-header">
        <h2>Produits</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>+ Nouveau produit</button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">Aucun produit pour le moment.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div className="product-card" key={p.id}>
              <h3>{p.name}</h3>
              {p.description && <p>{p.description}</p>}
              {p.category && <span className="badge">{p.category}</span>}
              <div className="price">{p.price.toFixed(2)} &euro;</div>
              <p>Stock : {p.stock}</p>
              {isAdmin && (
                <div className="actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Modifier</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
