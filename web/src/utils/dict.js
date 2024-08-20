
// 获取字典Label
export const getDictLabel = (dict_list, dict_type, dict_value) => {
    const type = dict_list.find(element => element.dict_type === dict_type)
    if (type) {
        const val = type.data_list.find((element) => element.dict_value === dict_value + '')
        if (val) {
            return val.dict_label
        } else {
            return dict_value
        }
    } else {
        return dict_value
    }
}

// 获取字典Label样式
export const getDictLabelClass = (dict_list, dict_type, dict_value) => {
    const type = dict_list.find(element => element.dict_type === dict_type)
    if (type) {
        const val = type.data_list.find((element) => element.dict_value === dict_value + '')
        if (val) {
            return val.label_class
        } else {
            return ''
        }
    } else {
        return ''
    }
}

// 获取字典数据列表
export function getDictDataList(dict_list, dict_type) {
    const type = dict_list.find((element) => element.dict_type === dict_type)
    if (type) {
        return type.data_list
    } else {
        return []
    }
}