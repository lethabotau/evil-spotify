import axios from 'axios'
import { getAccessToken } from './spotifyAuth'

export const spotify = axios.create({
  baseURL: 'https://api.spotify.com/v1',
})

spotify.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
