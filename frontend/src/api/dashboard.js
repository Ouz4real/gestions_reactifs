import api from './axios'

export const getDashboardStats = () => api.get('/dashboard/stats')
export const getMouvements = (debut, fin) => api.get('/dashboard/mouvements', { params: { debut, fin } })
