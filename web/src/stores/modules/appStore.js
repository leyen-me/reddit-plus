import {defineStore} from 'pinia'
import {useDictTypeAllApi} from '@/api/sys/dict'
import constantDict from "@/constants/modules/constantDict";

const useAppStore = defineStore('appStore', {
    state: () => ({
        // 字典列表
        dictList: constantDict,
    }),
    actions: {
        async getDictListAction() {
            const {data} = await useDictTypeAllApi()
            this.dictList = this.dictList.concat(data || [])
        }
    }
})
export default useAppStore