import {defineStore} from 'pinia'
import {useAccountLoginApi } from '@/api/auth'

const useUserStore = defineStore('userStore', {
    state: () => ({
        // 用户信息
        user: {
            id: '',
            username: '小明',
            phone: '17608337515',
            avatar: ''
        },
        // 登录token
        token: localStorage.getItem("token")
    }),
    actions: {
        // 账号登录
        async accountLoginAction(loginForm) {
            const {data} = await useAccountLoginApi(loginForm)
            // this.setToken(data.access_token)
        },
    }
})

export default useUserStore