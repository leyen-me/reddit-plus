
/**
 * ElementPlus的所有Icon
 */
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

export default {
    install(app) {
        /**
         * 注册所有的ElementPlusIcon
         */
        for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
            app.component(key, component);
        }
    },
};