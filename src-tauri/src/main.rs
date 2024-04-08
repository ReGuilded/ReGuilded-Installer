// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fmt::format;
use tauri::{AppHandle, Manager};

#[tauri::command]
fn get_installer_version() -> String {
  format!("v{}", env!("CARGO_PKG_VERSION"))
}

#[tauri::command]
fn preface_begin(app_handle: AppHandle) {
    let preface_window = app_handle.get_window("preface").unwrap();

    let _ = preface_window.eval(&format!("window.location.pathname = '/{}'", "splashscreen.html"));
}

fn main() {
  tauri::Builder::default()
      .setup(|app| {
          let splashscreen_window = app.get_window("splashscreen").unwrap();
          let preface_window = app.get_window("preface").unwrap();

          tauri::async_runtime::spawn(async move {
              println!("Initializing...");
              std::thread::sleep(std::time::Duration::from_secs(7));
              println!("Done initializing...");

              splashscreen_window.close().unwrap();
              preface_window.show().unwrap();
              preface_window.set_focus().unwrap();
          });

          Ok(())
      })
      .invoke_handler(tauri::generate_handler![get_installer_version])
      .invoke_handler(tauri::generate_handler![preface_begin])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}
