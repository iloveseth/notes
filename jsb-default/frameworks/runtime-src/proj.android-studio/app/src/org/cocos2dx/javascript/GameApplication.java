/****************************************************************************
 * by seth@2019-01-22
 ***************************************************************************/

package org.cocos2dx.javascript;

import com.quicksdk.QuickSdkApplication;
import com.tendcloud.tenddata.TalkingDataGA;

public class GameApplication extends QuickSdkApplication {

    @Override
    public void onCreate() {
        super.onCreate();
        TalkingDataGA.init(this,"FBA6B80D16224C93B500405AE877A69B","000");
    }

}
