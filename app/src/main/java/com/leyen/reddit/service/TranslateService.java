package com.leyen.reddit.service;


import okhttp3.*;

import android.annotation.SuppressLint;
import android.content.Context;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import org.json.JSONArray;
import org.json.JSONException;

import java.io.IOException;

public class TranslateService {

    private final WebView webView;

    public TranslateService(WebView webView) {
        this.webView = webView;
    }

    @JavascriptInterface
    public void translateText(final String type, final String tKey, String[] textList) throws JSONException {
        OkHttpClient client = new OkHttpClient();
        String jsonBody = new JSONArray(textList).toString();
        RequestBody requestBody = RequestBody.create(
                jsonBody, MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url("https://reddit.leyen.me/api/translate")
                .post(requestBody)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                webView.post(new Runnable() {
                    @Override
                    public void run() {

                    }
                });
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull final Response response) throws IOException {
                if (response.body() == null) {
                    return;
                }
                try {
                    String responseString = response.body().string();
                    JSONArray jsonArray = new JSONArray(responseString);
                    for (int i = 0; i < jsonArray.length(); i++) {
                        final String translatedText = jsonArray.getString(i);
                        @SuppressLint("DefaultLocale") final String jsCode = String.format("javascript:translateCallback('%s','%s', %d, `%s`)", type, tKey, i, translatedText);
                        webView.post(() -> webView.evaluateJavascript(jsCode, null));
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
