// chrome://inspect/#devices
// allow pasting

const transGap = 100;

const log = (str = "") => {
  console.log(str);
};

// 随机生成ID函数
const generateUUID = (length = 8) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// 防抖
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * 翻译类型
 */
const TRANSLATE_TYPE = {
  SIMPLE: "SIMPLE",
};

/**
 * 翻译任务
 */
const translateMap = new Map();

/**
 * 翻译文本
 *
 * 翻译那种类型
 * 翻译的ID
 * 翻译的所有元素
 * 翻译的所有文本
 */
const translates = (type, key, elements, textList) => {
  translateMap.set(key, { elements, textList });
  TranslateService.translateText(type, key, textList);
};

const translated = (ele, value) => {
  ele.setAttribute("data-translated", "true");
  ele.removeAttribute("data-translating");
  ele.innerText = value;
};

const handleTranslateHomeTitle = (ele, value) => {
  if (ele.shadowRoot) {
    const titleSlot = ele.shadowRoot.querySelector("slot[name='title']");
    if (titleSlot) {
      const title = titleSlot.assignedElements()[0];
      translated(title, value);
    }
  }
};

const handleTranslateHomeBody = (ele, value) => {
  if (ele.shadowRoot) {
    const slot = ele.shadowRoot.querySelector("slot[name='text-body']");
    if (slot) {
      const bodyEle = slot.assignedElements()[0];
      translated(bodyEle, value);
    }
  }
};

const handleTranslateComment = (ele, value) => {
  translated(ele, value);
};

/**
 * 翻译回调
 * @param {*} key
 * @param {*} value
 */
const translateCallback = (type, key, index, value) => {
  const { elements } = translateMap.get(key);
  const ele = elements[index];
  if (ele) {
    switch (type) {
      case TRANSLATE_TYPE.SIMPLE:
        translated(ele, value);
    }
  }
};

/**
 * 所有帖子的关注按钮翻译
 */
const handleAddPostJoinButton2Translate = async () => {
  const joinButtons = document.querySelectorAll("shreddit-join-button");
  for (let i = 0; i < joinButtons.length; i++) {
    const joinButton = joinButtons[i];
    const button = joinButton.shadowRoot.querySelector("button");
    if (button) {
      const text = button.innerText;
      if (!button.hasAttribute("data-translated")) {
        button.setAttribute("data-translating", "true");
        button.innerText = "关注";
      }
    }
  }
};

/**
 * 通用的
 * @param {} querySelectorAll
 * @param {*} type
 */
const handleAddTranslateBySelectorAll = async (querySelectorAll, type) => {
  const ts = [];
  const transElements = [];
  const comments = document.querySelectorAll(querySelectorAll);

  for (let i = 0; i < comments.length; i++) {
    const commentEle = comments[i];
    if (
      !commentEle.hasAttribute("data-translated") &&
      !commentEle.hasAttribute("data-translating")
    ) {
      commentEle.setAttribute("data-translating", "true");
      ts.push(commentEle.innerText);
      transElements.push(commentEle);
    }
  }

  if (ts.length > 0) {
    translates(type, generateUUID(), transElements, ts);
  }
};

const handleAddSearchTitle2Translate = async () => {
  const ts = [];
  const transElements = [];
  const postConsumeTrackers = document.querySelectorAll("post-consume-tracker");

  for (let i = 0; i < postConsumeTrackers.length; i++) {
    const secondTracker = postConsumeTrackers[i];
    const slotElement = secondTracker.shadowRoot.querySelector("slot");
    if (slotElement) {
      const assignedElements = slotElement.assignedElements();
      if (assignedElements.length > 0) {
        const titleElement = assignedElements[0].querySelector(
          '[data-testid="post-title-text"]'
        );
        if (
          titleElement &&
          !titleElement.hasAttribute("data-translated") &&
          !titleElement.hasAttribute("data-translating")
        ) {
          titleElement.setAttribute("data-translating", "true");
          const titleText = titleElement.innerText;
          ts.push(titleText);
          transElements.push(titleElement);
        }
      }
    }
  }

  if (ts.length > 0) {
    translates(TRANSLATE_TYPE.SIMPLE, generateUUID(), transElements, ts);
  }
};

const handleTranslate = () => {
  console.log("translate...");
  // 文章标题
  handleAddTranslateBySelectorAll('[slot="title"]', TRANSLATE_TYPE.SIMPLE);
  // 文章内容
  handleAddTranslateBySelectorAll('[slot="text-body"]', TRANSLATE_TYPE.SIMPLE);
  // 评论
  handleAddTranslateBySelectorAll('[slot="comment"]', TRANSLATE_TYPE.SIMPLE);
  // 推荐文章标题
  handleAddTranslateBySelectorAll(
    "h3.i18n-list-item-post-title",
    TRANSLATE_TYPE.SIMPLE
  );
  // 文章推荐原因
  handleAddTranslateBySelectorAll(
    '[slot="recommendation-bar"] p',
    TRANSLATE_TYPE.SIMPLE
  );
  handleAddTranslateBySelectorAll(
    '[slot="credit-bar"] p',
    TRANSLATE_TYPE.SIMPLE
  );
  // 文章推荐标题
  handleAddTranslateBySelectorAll(
    "#right-sidebar-container > h2",
    TRANSLATE_TYPE.SIMPLE
  );
  handleAddTranslateBySelectorAll(
    ".i18n-right-rail-topic-name",
    TRANSLATE_TYPE.SIMPLE
  );

  handleAddSearchTitle2Translate()
  // 关注按钮
  handleAddPostJoinButton2Translate();
};

/**
 * 监听DOM变化
 */
const debouncedTranslateTitle = debounce(handleTranslate, transGap);
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      debouncedTranslateTitle();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// 每隔transGap时间，翻译一次。5秒后停止
const interval = setInterval(() => {
  debouncedTranslateTitle();
}, transGap * 2);

setTimeout(() => {
  if (interval) {
    clearInterval(interval);
  }
}, 5000);