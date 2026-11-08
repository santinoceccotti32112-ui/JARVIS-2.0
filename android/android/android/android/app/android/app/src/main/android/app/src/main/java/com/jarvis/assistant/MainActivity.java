package com.jarvis.assistant;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.WebSettings;
import android.Manifest;
import android.content.pm.PackageManager;
import android.webkit.JavascriptInterface;

public class MainActivity extends Activity {

    private WebView navegador;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        navegador = new WebView(this);

        WebSettings ajustes = navegador.getSettings();
        ajustes.setJavaScriptEnabled(true);
        ajustes.setDomStorageEnabled(true);
        ajustes.setMediaPlaybackRequiresUserGesture(false);

        navegador.setWebViewClient(new WebViewClient());

        navegador.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        setContentView(navegador);

        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(
                new String[]{Manifest.permission.RECORD_AUDIO}, 1
            );
        }

        navegador.loadUrl("https://darling-melba-2b3fee.netlify.app");
    }

    @Override
    public void onBackPressed() {
        if (navegador.canGoBack()) {
            navegador.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
