import api from './axios'

export const getProduits = () => api.get('/produits')
export const getProduit = (id) => api.get(`/produits/${id}`)
export const createProduit = (data) => api.post('/produits', data)
export const updateProduit = (id, data) => api.put(`/produits/${id}`, data)
export const deleteProduit = (id) => api.delete(`/produits/${id}`)
