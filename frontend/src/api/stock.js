import api from './axios'

export const consommer = (data) => api.post('/stock/consommer', data)
export const getHistorique = () => api.get('/stock/historique')
export const getHistoriqueProduit = (id) => api.get(`/stock/historique/${id}`)
export const getAlertes = () => api.get('/stock/alertes')
export const getStockTotal = (id) => api.get(`/stock/total/${id}`)
