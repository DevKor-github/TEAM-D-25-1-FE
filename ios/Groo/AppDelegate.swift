import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

// ① 여기 추가
import NMapsMap

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // ② React 초기화 이전에 클라이언트 ID 설정/Users/songminju/TEAM-D-25-1-FE/ios/Pods/Target Support Files/Pods-Groo/Pods-Groo.debug.xcconfig
    
  
//    NMFClient.sharedClient().clientId = "pxgklz6a3t"

    // --- 기존 코드 ---
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Groo",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
  #if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
  #else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  #endif
  }
}

