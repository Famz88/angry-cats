package com.famzz.angrycats;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebChromeClient;
import android.view.DisplayCutout;
import java.io.IOException;

/** Offline-only local WebView host; no network permission or JavaScript bridge. */
public final class MainActivity extends Activity {
    private WebView game;
    private static final String ORIGIN = "https://game.angrycats.local/";

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        game = new WebView(this);
        game.setBackgroundColor(0xff28432a);
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.getSettings().setMediaPlaybackRequiresUserGesture(true);
        game.setWebChromeClient(new WebChromeClient());
        // Android 15 draws edge-to-edge. Keep controls outside the camera cutout.
        game.setOnApplyWindowInsetsListener((view, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 28) {
                DisplayCutout cutout = insets.getDisplayCutout();
                view.setPadding(cutout == null ? 0 : cutout.getSafeInsetLeft(),
                    cutout == null ? 0 : cutout.getSafeInsetTop(),
                    cutout == null ? 0 : cutout.getSafeInsetRight(),
                    cutout == null ? 0 : cutout.getSafeInsetBottom());
            }
            return insets;
        });
        game.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return !request.getUrl().toString().startsWith(ORIGIN); }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (!url.startsWith(ORIGIN)) return new WebResourceResponse("text/plain", "UTF-8", null);
                String path = request.getUrl().getPath();
                if(path == null || path.equals("/")) path = "/index.html";
                if(path.contains("..")) return new WebResourceResponse("text/plain", "UTF-8", null);
                String mime = path.endsWith(".js") ? "application/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".svg") ? "image/svg+xml" : "text/html";
                try { return new WebResourceResponse(mime, "UTF-8", getAssets().open(path.substring(1))); }
                catch(IOException error) { return new WebResourceResponse("text/plain", "UTF-8", null); }
            }
        });
        setContentView(game);
        game.loadUrl(ORIGIN);
    }
    @Override protected void onPause() {
        if(game != null) { game.evaluateJavascript("window.AngryCatsLifecycle?.pause()", null); game.onPause(); }
        super.onPause();
    }
    @Override protected void onResume() { super.onResume(); if(game != null) game.onResume(); }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }
    @SuppressWarnings("deprecation") @Override public void onBackPressed() { game.evaluateJavascript("window.AngryCatsLifecycle?.back()", null); }
    @Override protected void onDestroy() { if(game != null) { game.destroy(); game=null; } super.onDestroy(); }
}
