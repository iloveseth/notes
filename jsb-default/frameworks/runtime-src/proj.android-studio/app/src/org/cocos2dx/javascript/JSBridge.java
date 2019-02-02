/****************************************************************************
 * by seth@2019-01-22
 ***************************************************************************/

package org.cocos2dx.javascript;

import android.widget.Toast;
import java.util.Date;
public class JSBridge {

    private static long backTs = 0;

    //游戏中调用的静态方法
    public static void Login(){
        AppActivity.getInstance().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                SDKWrapper.getInstance().sdkLogin();
            }
        });
    }

    public static void Logout(){}

    public static void SetUserInfo(String roleInfoStr){
        SDKWrapper.getInstance().sdkSetUserInfo(roleInfoStr);
    }

    public static void Pay(String payStr){
        SDKWrapper.getInstance().sdkPay(payStr);
    }

    public static void OnBackPressed(){
        long curBackTs =  new Date().getTime();
        if(curBackTs - backTs < 2000){
            System.exit(0);
        }
        else{
            AppActivity.getInstance().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast toast = Toast.makeText(AppActivity.getInstance(),"再按一次退出游戏！",Toast.LENGTH_SHORT);
                    toast.show();
                }
            });
            backTs = curBackTs;
        }
    }

    public static void ShowToast(final String info){
        AppActivity.getInstance().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast toast = Toast.makeText(AppActivity.getInstance(),info,Toast.LENGTH_SHORT);
                toast.show();
            }
        });
    }

    public static void HideSplash(){
        AppActivity.getInstance().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AppActivity.getInstance().hideSplash();
            }
        });
    }

    public static void SetAccount(String accoutnStr){
        SDKWrapper.getInstance().sdkSetAccount(accoutnStr);
    }
}
