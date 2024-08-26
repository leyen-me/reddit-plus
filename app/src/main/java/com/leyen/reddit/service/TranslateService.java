package com.leyen.reddit.service;


import okhttp3.*;

import android.annotation.SuppressLint;
import android.content.Context;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class TranslateService {

    private final Context context;
    private final WebView webView;

    public TranslateService(Context context, WebView webView) {
        this.webView = webView;
        this.context = context;
    }

    private void log(String str) {
        webView.post(() -> webView.evaluateJavascript("javascript:log(`" + str + "`)", null));
    }

    private void checkAndRefreshAuthorization(String type, String tKey, String[] textList) {
        String authorization = this.context.getSharedPreferences("TranslatePrefs", Context.MODE_PRIVATE)
                .getString("Authorization", "");
        if (authorization.isEmpty()) {
            fetchAuthorizationFromServer(type, tKey, textList);
            return;
        }
        // 直接翻译
        performTranslation(type, tKey, textList);
    }

    private void fetchAuthorizationFromServer(String type, String tKey, String[] textList) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://edge.microsoft.com/translate/auth")
                .get()
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                // Handle failure
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (response.isSuccessful() && response.body() != null) {
                    String authorization = response.body().string().trim();
                    // Store the authorization in SharedPreferences
                    context.getSharedPreferences("TranslatePrefs", Context.MODE_PRIVATE)
                            .edit()
                            .putString("Authorization", authorization)
                            .apply();

                    performTranslation(type, tKey, textList);
                }
            }
        });
    }

    public void performTranslation(String type, String tKey, String[] textList) {
        OkHttpClient client = new OkHttpClient();
        String jsonBody = "[]";
        try {
            JSONArray jsonArray = new JSONArray();
            for (String text : textList) {
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("Text", text);
                jsonArray.put(jsonObject);
            }
            jsonBody = jsonArray.toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        RequestBody requestBody = RequestBody.create(
                jsonBody, MediaType.parse("application/json"));

        String authorization = context.getSharedPreferences("TranslatePrefs", Context.MODE_PRIVATE)
                .getString("Authorization", "");

        Request request = new Request.Builder()
                .url("https://api-edge.cognitive.microsofttranslator.com/translate?from&to=zh-CHS&api-version=3.0&includeSentenceLength=true")
                .post(requestBody)
                .addHeader("Authorization", "Bearer " + authorization)
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
                String responseString = response.body().string();
                if (response.code() == 401) {
                    // 401 Unauthorized
                    fetchAuthorizationFromServer(type, tKey, textList);
                    return;
                }
                try {
                    JSONArray jsonArray = new JSONArray(responseString);
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject jsonObject = jsonArray.getJSONObject(i);
                        JSONObject translationObject = jsonObject.getJSONArray("translations").getJSONObject(0);
                        final String translatedText = translationObject.getString("text");
                        
                        @SuppressLint("DefaultLocale") final String jsCode = String.format("javascript:translateCallback('%s','%s', %d, `%s`)", type, tKey, i, translatedText);
                        webView.post(() -> webView.evaluateJavascript(jsCode, null));
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    @JavascriptInterface
    public void translateText(final String type, final String tKey, String[] textList) throws JSONException {
        checkAndRefreshAuthorization(type, tKey, textList);
    }
}
