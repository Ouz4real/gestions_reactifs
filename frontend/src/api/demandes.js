import api from './axios'

export const creerDemande = (data) => api.post('/demandes', data)
export const getMesDemandes = () => api.get('/demandes/mes-demandes')
export const getDemandesEnAttente = () => api.get('/demandes/en-attente')
export const getDemandesValidees = () => api.get('/demandes/validees')
export const validerDemande = (id, approuver, commentaire) =>
  api.put(`/demandes/${id}/valider`, null, { params: { approuver, commentaire } })
export const traiterDemande = (id) => api.put(`/demandes/${id}/traiter`)
