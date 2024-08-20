import service from '@/utils/request'

export const useAccountLoginApi = (data) => {
    return service.post('/sys/auth/login', data)
}
