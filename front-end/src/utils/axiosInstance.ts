import axios from "axios";
import { getCookie } from "cookies-next";

const accessToken = getCookie("access")
const refreshToken = getCookie("refresh")

const AxiosInstance = axios.create({
    baseURL: `https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}`,
    withCredentials: true,
});

AxiosInstance.interceptors.request.use(async config => {
    if (accessToken) {
        try {
            const decodeResponse = await fetch(`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/v1/decode_and_check/`, {
                method: "POST",
                body: JSON.stringify({
                    access_token: accessToken
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (decodeResponse.status === 401) {
                if (refreshToken) {
                    const refreshResponse = await fetch(`https://${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/v1/refresh/`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            refresh: refreshToken
                        })
                    });

                    const refreshData = await refreshResponse.json();
                    if (refreshResponse.ok) {
                        config.headers.Authorization = `Bearer ${refreshData.access}`;
                    }

                }
            }
        } catch (error) {
            // t('erroroccurred');
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});


export default AxiosInstance;