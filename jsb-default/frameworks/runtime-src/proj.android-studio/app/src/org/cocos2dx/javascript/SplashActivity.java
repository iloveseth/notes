/****************************************************************************
 * by seth@2019-01-22
 ***************************************************************************/

package org.cocos2dx.javascript;

import android.content.Intent;
import android.graphics.Color;

import com.quicksdk.QuickSdkSplashActivity;

public class SplashActivity extends QuickSdkSplashActivity {

    @Override
    public int getBackgroundColor() {
        return Color.WHITE;
    }
    @Override
    public void onSplashStop() {
        //闪屏结束后，跳转到游戏界面
        Intent intent = new Intent(this, AppActivity.class);
        startActivity(intent);
        this.finish();
    }
}
