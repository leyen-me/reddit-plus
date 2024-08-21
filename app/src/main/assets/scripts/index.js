// chrome://inspect/#devices
// allow pasting

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
  HOME_TITLE: "HOME_TITLE",
  HOME_BODY: "HOME_BODY",

  COMMENT: "COMMENT",

  POST_TITLE: "POST_TITLE",
  POST_CONTENT: "POST_CONTENT",
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
function translates(type, key, elements, textList) {
  translateMap.set(key, { elements, textList });
  TranslateService.translateText(type, key, textList);
}

const handleTranslateHomeTitle = (ele, value) => {
  if (ele.shadowRoot) {
    const titleSlot = ele.shadowRoot.querySelector("slot[name='title']");
    if (titleSlot) {
      const title = titleSlot.assignedElements()[0];
      title.setAttribute("data-translated", "true");
      title.removeAttribute("data-translating");
      title.innerText = value;
    }
  }
};

const handleTranslateHomeBody = (ele, value) => {
  if (ele.shadowRoot) {
    const slot = ele.shadowRoot.querySelector("slot[name='text-body']");
    if (slot) {
      const bodyEle = slot.assignedElements()[0];
      bodyEle.setAttribute("data-translated", "true");
      bodyEle.removeAttribute("data-translating");
      bodyEle.innerText = value;
    }
  }
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
      case TRANSLATE_TYPE.HOME_TITLE:
        handleTranslateHomeTitle(ele, value);
        break;
      case TRANSLATE_TYPE.HOME_BODY:
        handleTranslateHomeBody(ele, value);
        break;
    }
  }
};

/**
 * 翻译首页标题
 */
const handleAddHomeTitle2Translate = async () => {
  const ts = [];
  const transElements = [];
  const allArticleElements = document.querySelectorAll("shreddit-post");

  for (let i = 0; i < allArticleElements.length; i++) {
    const post = allArticleElements[i];
    const titleSlot = post.shadowRoot.querySelector("slot[name='title']");
    const bodySlot = post.shadowRoot.querySelector("slot[name='text-body']");
    if (titleSlot) {
      const titleEle = titleSlot.assignedElements()[0];
      const title = titleEle.innerText;
      if (
        !titleEle.hasAttribute("data-translated") &&
        !titleEle.hasAttribute("data-translating")
      ) {
        titleEle.setAttribute("data-translating", "true");
        ts.push(title);
        transElements.push(post);
      }
    }
  }
  if (ts.length > 0) {
    translates(
      TRANSLATE_TYPE.HOME_TITLE,
      generateUUID(),
      transElements,
      ts
    );
  }
};

const handleAddHomeBody2Translate = async () => {
  const ts = [];
  const transElements = [];
  const allArticleElements = document.querySelectorAll("shreddit-post");

  for (let i = 0; i < allArticleElements.length; i++) {
    const post = allArticleElements[i];
    const bodySlot = post.shadowRoot.querySelector("slot[name='text-body']");
    if (bodySlot) {
      const bodyEle = bodySlot.assignedElements()[0];
      if (bodyEle) {
        const body = bodyEle.innerText;
        if (
          !bodyEle.hasAttribute("data-translated") &&
          !bodyEle.hasAttribute("data-translating")
        ) {
          bodyEle.setAttribute("data-translating", "true");
          ts.push(body);
          transElements.push(post);
        }
      }
    }
  }

  if (ts.length > 0) {
    translates(TRANSLATE_TYPE.HOME_BODY, generateUUID(), transElements, ts);
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

const handleAddComment2Translate = async () => {
  const ts = [];
  const transElements = [];
  const comments = document.querySelectorAll('div[slot="comment"]');

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
    translates(TRANSLATE_TYPE.COMMENT, generateUUID(), transElements, ts);
  }
};

const handleTranslate = () => {
  handleAddHomeTitle2Translate();
  handleAddHomeBody2Translate();
  handleAddPostJoinButton2Translate();
  handleAddComment2Translate();
};

/**
 * 监听DOM变化
 */
const debouncedTranslateTitle = debounce(handleTranslate, 1000);
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      debouncedTranslateTitle();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

/**
 * 监听路由的变化
 */


setTimeout(() => {
  debouncedTranslateTitle();
}, 1500);
