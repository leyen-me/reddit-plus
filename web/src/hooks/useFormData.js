import {ref} from 'vue'
import _ from 'lodash'

const useRefFormData = data => {
    const initData = _.cloneDeep(data)
    const formData = ref(_.cloneDeep(data))
    const formDataReset = () => {
        for (let k in formData.value) {
            formData.value[k] = initData[k]
        }
    }
    const formDataAssign = obj => {
        for (let k in initData) {
            const item = obj[k]
            if (item === undefined || item === null) {
                formData.value[k] = initData[k]
            } else {
                formData.value[k] = item
            }
        }
    }
    return {formData, formDataReset, formDataAssign}
}

export  useRefFormData