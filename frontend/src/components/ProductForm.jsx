import { useState, useEffect } from 'react';

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',
    category: '',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: String(product.price ?? ''),
        stock: String(product.stock ?? 0),
        category: product.category || '',
      });
    }
  }, [product]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      category: form.category || null,
    });
  }

  return (
    <div className="product-form-overlay" onClick={onCancel}>
      <div className="product-form" onClick={(e) => e.stopPropagation()}>
        <h3>{product ? 'Modifier le produit' : 'Nouveau produit'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Prix</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Catégorie</label>
            <input name="category" value={form.category} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Enregistrer</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
