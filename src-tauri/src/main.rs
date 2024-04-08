// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_installer_version() -> String {
  format!("v{}", env!("CARGO_PKG_VERSION"))
}

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![get_installer_version])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}
