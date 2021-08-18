//
//  AppDelegate.swift
//  ReGuildedSetup
//
//  Created by IT on 17/08/21.
//

import Cocoa
import SwiftUI

@main
class AppDelegate: NSObject, NSApplicationDelegate {

    var window: NSWindow!


    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Create the SwiftUI view that provides the window contents.
        let contentView = ContentView()
       
        // Create the window and set the content view.
        window = NSWindow(
            contentRect: NSRect(x: 20, y: 20, width: 500, height: 500),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)
        window.isReleasedWhenClosed = false
        window.center()
        window.setFrameAutosaveName("Main Window")
      
        let visualEffect = NSVisualEffectView()
        visualEffect.blendingMode = .behindWindow
        visualEffect.state = .active

        visualEffect.material = .dark
        let x = (visualEffect.bounds.width - 200) * 0.5
         let y = (visualEffect.bounds.height - 200) * 0.5
         let f = CGRect(x: x, y: y, width: 200, height: 200)
        let subview = NSHostingView(rootView: contentView);
         subview.autoresizingMask = [.minXMargin, .maxXMargin, .minYMargin, .maxYMargin ]
        visualEffect.addSubview(subview)
        window?.contentView = visualEffect

        
                            
        
 
        window?.titlebarAppearsTransparent = true
        window?.styleMask.insert(.fullSizeContentView)
        window.makeKeyAndOrderFront(nil)
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
    }


}

