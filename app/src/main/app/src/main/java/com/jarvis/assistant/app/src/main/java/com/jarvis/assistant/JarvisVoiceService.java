package com.jarvis.assistant;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

public class JarvisVoiceService extends Service {

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
