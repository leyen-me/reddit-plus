import { onMounted, ref } from "vue";
import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";

import service from "@/utils/request";

const useCrud = (options) => {
  /* 覆盖默认配置的方法 */
  const mergeDefaultOptions = () => {
    for (const key in state.value) {
      if (Object.getOwnPropertyDescriptor(options, key)) {
        state.value[key] = options[key];
      }
    }
  };

  /* 默认配置 */
  const state = ref({
    // 基础Url，根据该UrL自动推导增删改查方法
    baseUrl: "",
    deleteUrl: "",
    createdIsNeed: true,
    isPage: true,
    primaryKey: "id",
    queryForm: {},
    dataList: [],
    order: "",
    asc: false,
    page: 1,
    limit: 10,
    total: 0,
    pageSizes: [1, 10, 20, 50, 100, 200],
    dataListLoading: false,
    dataListSelections: [],
  });

  mergeDefaultOptions();

  const resetQueryForm = () => {
    for (const key in state.value.queryForm) {
      if (typeof state.value.queryForm[key] === "string") {
        state.value.queryForm[key] = "";
      } else if (typeof state.value.queryForm[key] === "number") {
        state.value.queryForm[key] = 0;
      }
    }
  };

  const resetPage = () => {
    state.value.page = 1;
  };

  onMounted(() => {
    if (state.value.createdIsNeed) {
      query();
    }
  });

  const query = () => {
    if (!state.value.baseUrl) {
      return;
    }
    state.value.dataListLoading = true;
    service
      .get(
        state.value.isPage
          ? state.value.baseUrl + "/page"
          : state.value.baseUrl + "/list",
        {
          params: {
            order: state.value.order,
            asc: state.value.asc,
            page: state.value.isPage ? state.value.page : null,
            limit: state.value.isPage ? state.value.limit : null,
            ...state.value.queryForm,
          },
        }
      )
      .then((res) => {
        state.value.dataList = state.value.isPage ? res.data.list : res.data;
        state.value.total = state.value.isPage ? res.data.total : 0;
      })
      .finally(() => {
        state.value.dataListLoading = false;
      });
  };

  const getDataList = () => {
    state.value.page = 1;
    query();
  };

  const sizeChangeHandle = (val) => {
    state.value.page = 1;
    state.value.limit = val;
    query();
  };

  const currentChangeHandle = (val) => {
    state.value.page = val;
    query();
  };

  // 多选
  const selectionChangeHandle = (selections) => {
    state.value.dataListSelections = selections.map(
      (item) => state.value.primaryKey && item[state.value.primaryKey]
    );
  };

  // 排序
  const sortChangeHandle = (data) => {
    const { prop, order } = data;

    if (prop && order) {
      state.value.order = prop;
      state.value.asc = order === "ascending";
    } else {
      state.value.order = "";
    }

    query();
  };

  const deleteHandle = (key) => {
    ElMessageBox.confirm("确定进行删除操作?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        service
          .delete(
            state.value.deleteUrl
              ? state.value.deleteUrl
              : state.value.baseUrl + "/" + key
          )
          .then(() => {
            ElMessage.success("删除成功");
            query();
          });
      })
      .catch(() => {});
  };

  const deleteBatchHandle = (key) => {
    let data = [];
    if (key) {
      data = [key];
    } else {
      data = state.value.dataListSelections
        ? state.value.dataListSelections
        : [];
      if (data.length === 0) {
        ElMessage.warning("请选择删除记录");
        return;
      }
    }

    ElMessageBox.confirm("确定进行删除操作?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        service
          .delete(
            state.value.deleteUrl ? state.value.deleteUrl : state.value.baseUrl,
            { data }
          )
          .then(() => {
            ElMessage.success("删除成功");
            query();
          });
      })
      .catch(() => {});
  };

  const downloadHandle = (url, filename, method) => {
    return axios({
      responseType: "blob",
      url: url,
      method: method,
    })
      .then((res) => {
        // 创建a标签
        const down = document.createElement("a");
        // 文件名没传，则使用时间戳
        down.download = filename || new Date().getTime().toString();
        // 隐藏a标签
        down.style.display = "none";

        // 创建下载url
        let binaryData = [];
        binaryData.push(res.data);
        down.href = URL.createObjectURL(new Blob(binaryData));

        // 模拟点击下载
        document.body.appendChild(down);
        down.click();

        // 释放URL
        URL.revokeObjectURL(down.href);
        // 下载完成移除
        document.body.removeChild(down);
      })
      .catch((err) => {
        ElMessage.error(err.message);
      });
  };

  return {
    state,
    getDataList,
    sizeChangeHandle,
    currentChangeHandle,
    selectionChangeHandle,
    sortChangeHandle,
    deleteHandle,
    deleteBatchHandle,
    downloadHandle,
    resetQueryForm
  };
};

export default useCrud;
