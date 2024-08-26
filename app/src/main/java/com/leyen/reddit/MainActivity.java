package com.leyen.reddit;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.leyen.reddit.service.TranslateService;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;


public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private boolean doubleBackToExitPressedOnce = false;

    public void pushCss(String cssPath) {
        try {
            InputStream inputStream = getAssets().open(cssPath);
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder cssBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                cssBuilder.append(line).append("\n");
            }
            reader.close();
            String css = cssBuilder.toString();
            // 注入CSS到网页
            String js = "var style = document.createElement('style');" +
                    "style.type = 'text/css';" +
                    "style.innerHTML = `" + css + "`;" +
                    "document.head.appendChild(style);";
            webView.evaluateJavascript(js, null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void pushJs(String jsPath) {
        try {
            InputStream inputStream = getAssets().open(jsPath);
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder jsBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsBuilder.append(line).append("\n");
            }
            reader.close();
            String js = jsBuilder.toString();
            webView.evaluateJavascript(js, null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void setSystemBars() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.status_bar_color));
    }

    public void setWebChromeClient() {
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView newWebView = new WebView(MainActivity.this);
                newWebView.setWebViewClient(new WebViewClient());
                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(newWebView);
                resultMsg.sendToTarget();
                return true;
            }
        });
    }

    @SuppressLint("SetJavaScriptEnabled")
    public void setWebSettings() {
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webView.getSettings().setSupportZoom(true);
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.getSettings().setUserAgentString("Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36");

        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
    }

    public void loadAssets(String htmlPath) {
        webView.loadUrl("file:///android_asset/" + htmlPath + ".html");
    }

    public void setWebViewClient() {
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageCommitVisible(WebView view, String url) {
                super.onPageCommitVisible(view, url);
                pushCss("styles/index.css");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefreshLayout.setRefreshing(false);
                pushJs("scripts/index.js");
            }
        });
    }

    public void setDebug() {
        WebView.setWebContentsDebuggingEnabled(true);
    }

    public void setBackPressedCallback() {
        OnBackPressedCallback callback = new OnBackPressedCallback(true /* enabled by default */) {
            @Override
            public void handleOnBackPressed() {

                if (webView.canGoBack()) {
                    webView.goBack(); // 如果 WebView 可以返回，则执行 WebView 的后退操作
                } else {
                    if (doubleBackToExitPressedOnce) {
                        finish(); // 如果 doubleBackToExitPressedOnce 为 true，执行默认的返回操作（退出应用）
                    } else {
                        doubleBackToExitPressedOnce = true;
                        Toast.makeText(getApplicationContext(), "再按一次返回键退出应用", Toast.LENGTH_SHORT).show();

                        // 设置一个延迟，超过这个时间重置 doubleBackToExitPressedOnce
                        new Handler().postDelayed(() -> doubleBackToExitPressedOnce = false, 2000);
                    }
                }
            }
        };
        getOnBackPressedDispatcher().addCallback(this, callback);
    }

    public void setWebViewRefreshListener(){
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                webView.reload();
            }
        });
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        setSystemBars();

        webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);

        setWebViewRefreshListener();
        setDebug();
        setWebChromeClient();
        setWebViewClient();
        setWebSettings();
        webView.addJavascriptInterface(new TranslateService(this, webView), "TranslateService");
        webView.loadUrl("https://www.reddit.com/");

        setBackPressedCallback();
    }
}