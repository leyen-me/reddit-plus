import axios from 'axios'
import qs from 'qs'
import {ElMessage} from 'element-plus'
import useUserStore from "@/stores/modules/userStore";

const service = axios.create({
    baseURL: "",
    timeout: 60000,
    headers: {'Content-Type': 'application/json;charset=UTF-8'}
})

service.interceptors.request.use(
    (config) => {
        const userStore = useUserStore()
        if (userStore.token) {
            config.headers.Authorization = userStore.token
        }
        config.headers['Accept-Language'] = 'zh-CN'
        /* 追加时间戳，防止GET请求缓存 */
        if (config.method.toUpperCase() === 'GET') {
            config.params = {...config.params, t: new Date().getTime()}
        }
        if (Object.values(config.headers).includes('application/x-www-form-urlencoded')) {
            config.data = qs.stringify(config.data)
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

service.interceptors.response.use(
    response => {
        const userStore = useUserStore()
        if (response.status !== 200) {
            return Promise.reject(new Error(response.statusText || 'Error'))
        }
        const res = response.data
        // 响应成功
        if (res.code === 0) {
            return res
        }
        // 错误提示
        ElMessage.error(res.msg)
        // 没有权限，如：未登录、登录过期等，需要跳转到登录页
        if (res.code === 401) {
            userStore.setToken('')
            location.reload()
        }
        return Promise.reject(new Error(res.msg || 'Error'))
    },
    error => {
        ElMessage.error(error.message)
        return Promise.reject(error)
    }
)

export default service