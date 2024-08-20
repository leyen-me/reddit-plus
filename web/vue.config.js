const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  assetsDir: "./",
  outputDir: "../app/src/main/assets",
  transpileDependencies: true,
  devServer: {
    client: {
      overlay: false,
    },
  },
});
