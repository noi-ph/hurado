import axios from 'axios'

export const https = axios.create({
    baseURL: 'https://hurado.ncisomendoza.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
})
