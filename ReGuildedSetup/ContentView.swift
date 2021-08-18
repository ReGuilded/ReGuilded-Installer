//
//  ContentView.swift
//  ReGuildedSetup
//
//  Created by IT on 17/08/21.
//

import SwiftUI

struct ContentView: View {
    @State var injectHover = false;
    @State var dontinjectHover = false;

    private func shell(command: String, path: String){
        let shellProcess = Process();
                          shellProcess.launchPath = "/usr/bin/osascript";
        let command_s = """
            tell application "Finder" to set theSel to selection
            tell application "Terminal"
            
             if (count of windows) is not 0 then
              do script "sh \(path)"  in window 1
             else
              do script "sh \(path)"
             end if
             activate
            end tell
            """
        shellProcess.arguments = ["-e", command_s]
        
        let pipe = Pipe()
        shellProcess.standardOutput = pipe

        shellProcess.launch()
        shellProcess.waitUntilExit()

        
        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        let output = NSString(data: data, encoding: String.Encoding.utf8.rawValue)

        print(output ?? "no output")

    }
    var body: some View {
      
        VStack {
        Text("ReGuilded")
            .font(.headline)
           
            Button(action: {
                let path = Bundle.main.path(forResource: "install", ofType:"sh")
                print(path ?? "nil lol")
                shell(command: "", path: String(describing: path!))
             
            }) {
                HStack {
                    if #available(macOS 11.0, *) {
                        Image(systemName: "square.and.arrow.down.fill")
                            .foregroundColor(dontinjectHover ? .white : .black)

                    } else {
                        // Fallback on earlier versions
                    }
                    Text("Inject")
                        .foregroundColor(dontinjectHover ? .white : .black)
                    
                }
            }
            .background(self.dontinjectHover ? Color.blue : Color.white)
            .foregroundColor(Color.white)
            .cornerRadius(5)
            .onHover(perform: { hovering in
                if(hovering){
                    self.dontinjectHover = true
                } else {
                    self.dontinjectHover = false
                }
                
            })
           
            Button(action: {
                let path = Bundle.main.path(forResource: "remove", ofType:"sh")
                print(path ?? "nil lol")
                shell(command: "", path: String(describing: path!))
            })
        
            {
                HStack {
                    if #available(macOS 11.0, *) {
                        Image(systemName: "square.and.arrow.up.fill")
                            .foregroundColor(injectHover ? .white : .black)
                           
                    } else {
                        // Fallback on earlier versions
                    }
                    Text("Remove")
                        .foregroundColor(injectHover ? .white : .black)
                        
                }
            }
            .background(self.injectHover ? Color.blue : Color.white)
            .foregroundColor(Color.white)
            .cornerRadius(5)
            .onHover(perform: { hovering in
                if(hovering){
                    self.injectHover = true
                } else {
                    self.injectHover = false
                }
                
            })
           
            
        }
        .padding(100)
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
