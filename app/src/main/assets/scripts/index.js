// chrome://inspect/#devices
// allow pasting

function translates(textList) {
  return new Promise((resolve, reject) => {
    resolve(JSON.parse(AndroidInterface.translateText(textList)));
  });
}

/**
 * 监听DOM变化
 */
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      // translates();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

/**
 * 判断是否是首页
 */
const isHomePage = () => {
  return document.URL === "https://www.reddit.com/";
};

const translateTitle = async () => {
  const ts = [];
  const elements = document.querySelectorAll("shreddit-post");
  elements.forEach((post) => {
    const titleSlot = post.shadowRoot.querySelector("slot[name='title']");
    if (titleSlot) {
      const title = titleSlot.assignedElements()[0].innerText;
      ts.push(title);
    }
  });

  if (ts.length > 0) {
    const res = await translates(ts);
    elements.forEach((post, index) => {
      const titleSlot = post.shadowRoot.querySelector("slot[name='title']");
      if (titleSlot) {
        titleSlot.assignedElements()[0].innerText = res[index];
      }
    });
  }
};


setTimeout(() => {
  translateTitle();
}, 3000);
