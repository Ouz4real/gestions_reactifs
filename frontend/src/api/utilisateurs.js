import api from './axios'

export const getUtilisateurs = () => api.get('/utilisateurs')
export const createUtilisateur = (data) => api.post('/utilisateurs', data)
export const toggleActif = (id) => api.put(`/utilisateurs/${id}/toggle-actif`)
export const updateRole = (id, role) => api.put(`/utilisateurs/${id}/role`, null, { params: { role } })
export const deleteUtilisateur = (id) => api.delete(`/utilisateurs/${id}`)
export const updateUtilisateur = (id, data) => api.put(`/utilisateurs/${id}`, data)
