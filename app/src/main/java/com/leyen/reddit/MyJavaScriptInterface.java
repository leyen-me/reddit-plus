package com.leyen.reddit;

import static java.lang.Thread.sleep;

import okhttp3.*;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONException;

public class MyJavaScriptInterface {

    private Context context;
    private WebView webView;

    MyJavaScriptInterface(WebView webView) {
//        this.context = context;
        this.webView = webView;
    }

    @JavascriptInterface
    public String translateText(String[] textList) throws InterruptedException, JSONException {
        OkHttpClient client = new OkHttpClient();
        String jsonBody = new JSONArray(textList).toString();
        RequestBody requestBody = RequestBody.create(
                MediaType.parse("application/json"), jsonBody);
        Request request = new Request.Builder()
                .url("https://reddit.leyen.me/api/translate")
                .post(requestBody)
                .build();
        try {
            Response response = client.newCall(request).execute();
            if (response.isSuccessful()) {
                return response.body().string();
            } else {
                return "[]";
            }
        } catch (Exception e) {
            return "[]";
        }
    }
}
