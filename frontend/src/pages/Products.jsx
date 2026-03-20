import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as productApi from '../services/productApi'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  category: '',
}

function formatError(err) {
  const d = err.response?.data
  if (typeof d?.detail === 'string') return d.detail
  if (Array.isArray(d?.detail)) {
    return d.detail.map((x) => x.msg || x).join(' ')
  }
  return err.message || 'Erreur réseau ou serveur'
}

export default function Products() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await productApi.listProducts()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(formatError(err))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      name: p.name ?? '',
      description: p.description ?? '',
      price: String(p.price ?? ''),
      stock: String(p.stock ?? '0'),
      category: p.category ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!isAdmin) return
    setSaving(true)
    setError('')
    try {
      await productApi.createProduct({
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        category: form.category.trim() || null,
      })
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(formatError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!isAdmin || editingId == null) return
    setSaving(true)
    setError('')
    try {
      await productApi.updateProduct(editingId, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        category: form.category.trim() || null,
      })
      cancelEdit()
      await load()
    } catch (err) {
      setError(formatError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) return
    if (!window.confirm('Supprimer ce produit ?')) return
    setError('')
    try {
      await productApi.deleteProduct(id)
      if (editingId === id) cancelEdit()
      await load()
    } catch (err) {
      setError(formatError(err))
    }
  }

  return (
    <div className="page">
      <h1 className="page__title">Produits</h1>
      <p className="page__lead">
        Données issues de l’API produits (FastAPI). JWT obligatoire ; écriture réservée aux
        administrateurs.
      </p>

      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="muted">Chargement de la liste…</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                {isAdmin ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="muted">
                    Aucun produit pour le moment.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.description ? (
                        <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {p.description}
                        </div>
                      ) : null}
                    </td>
                    <td>{Number(p.price).toFixed(2)} €</td>
                    <td>{p.stock}</td>
                    <td>{p.category || '—'}</td>
                    {isAdmin ? (
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="btn btn--ghost btn--small"
                            onClick={() => startEdit(p)}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => handleDelete(p.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin ? (
        <div className="card product-form">
          <h3>{editingId ? 'Modifier le produit' : 'Nouveau produit'}</h3>
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="p-name">Nom</label>
                <input
                  id="p-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="p-cat">Catégorie</label>
                <input
                  id="p-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="p-desc">Description</label>
              <textarea
                id="p-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="p-price">Prix (€)</label>
                <input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="p-stock">Stock</label>
                <input
                  id="p-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
            </div>
            <div className="actions">
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer'}
              </button>
              {editingId ? (
                <button type="button" className="btn btn--ghost" onClick={cancelEdit}>
                  Annuler
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : (
        <p className="muted" style={{ marginTop: '2rem' }}>
          Connecté en tant qu’utilisateur : lecture seule. Demandez un compte{' '}
          <strong>admin</strong> (base Auth) pour gérer le catalogue.
        </p>
      )}
    </div>
  )
}
