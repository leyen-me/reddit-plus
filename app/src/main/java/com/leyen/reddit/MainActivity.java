package com.leyen.reddit;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
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

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;


public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private boolean doubleBackToExitPressedOnce = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        //
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(ContextCompat.getColor(this, R.color.status_bar_color));
        webView = findViewById(R.id.webView);

        WebChromeClient webChromeClient = new WebChromeClient();
        webView.setWebChromeClient(webChromeClient);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webView.getSettings().setSupportZoom(true);
//        webView.loadUrl("file:///android_asset/index.html");
        // 禁止android打开外部应用
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("https://www.reddit.com/")) {
                    // 让 WebView 加载这个 URL
                    return false;
                } else {
                    // 在外部浏览器中打开这个 URL
//                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
//                    startActivity(intent);
                    return true;
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                // 读取CSS文件内容
                try {
                    InputStream inputStream = getAssets().open("style/style.css");
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
        });
        webView.setWebContentsDebuggingEnabled(true);
        webView.loadUrl("https://www.reddit.com/");


//        https://www.reddit.com/?rdt=42985

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
}