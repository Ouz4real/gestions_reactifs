import api from './axios'

export const getLotsByProduit = (produitId) => api.get(`/lots/produit/${produitId}`)
export const getLotsPerimantBientot = () => api.get('/lots/peremption-proche')
export const createLot = (data) => api.post('/lots', data)
