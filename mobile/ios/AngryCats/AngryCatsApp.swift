import SwiftUI
import WebKit
import UIKit

@main
struct AngryCatsApp: App {
    var body: some Scene {
        WindowGroup { GameView().ignoresSafeArea().statusBarHidden(true) }
    }
}

struct GameView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator
        view.uiDelegate = context.coordinator
        view.isOpaque = false
        view.backgroundColor = UIColor(red: 0.16, green: 0.26, blue: 0.16, alpha: 1)
        view.scrollView.isScrollEnabled = false
        view.scrollView.bounces = false
        view.scrollView.contentInsetAdjustmentBehavior = .never
        context.coordinator.view = view
        NotificationCenter.default.addObserver(context.coordinator, selector: #selector(Coordinator.pause), name: UIApplication.willResignActiveNotification, object: nil)
        if let root = Bundle.main.url(forResource: "www", withExtension: nil),
           let page = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www") {
            view.loadFileURL(page, allowingReadAccessTo: root)
        }
        return view
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        NotificationCenter.default.removeObserver(coordinator)
        uiView.stopLoading()
        uiView.navigationDelegate = nil
        uiView.uiDelegate = nil
    }
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        weak var view: WKWebView?
        @objc func pause() { view?.evaluateJavaScript("window.AngryCatsLifecycle?.pause()", completionHandler: nil) }
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            guard var presenter = webView.window?.rootViewController else { completionHandler(false); return }
            while let presented = presenter.presentedViewController { presenter = presented }
            let alert = UIAlertController(title: "Angry Cats", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in completionHandler(false) })
            alert.addAction(UIAlertAction(title: "Reset", style: .destructive) { _ in completionHandler(true) })
            presenter.present(alert, animated: true)
        }
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(navigationAction.request.url?.isFileURL == true ? .allow : .cancel)
        }
    }
}
