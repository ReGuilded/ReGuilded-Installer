// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::Path;
use tauri::{Manager};
use crate::util::platform_handler::PlatformHandler;

mod util { pub mod platform_handler; }

#[tauri::command]
fn preface_begin(window: tauri::Window) {
    let _ = window.eval(&format!("window.location.pathname = '/{}'", "main.html"));
}

#[tauri::command]
fn get_rg_install() -> Result<(), String> {
    let platform_handler = &*PLATFORM_HANDLER.lock().unwrap();

    if let Some(platform) = platform_handler.get_platform() {
        let reguilded_asar = platform.reguilded_dir.join("reguilded.asar").to_string_lossy().to_string();

        if Path::new(&reguilded_asar).exists() {
            Ok(())
        } else {
            println!("Haha");
            Err("NO_INSTALL".into())
        }
    } else {
        Err("NOT_SUPPORTED".into())
    }
}

lazy_static::lazy_static! {
    static ref PLATFORM_HANDLER: std::sync::Mutex<PlatformHandler> = std::sync::Mutex::new(PlatformHandler::new());
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let splashscreen_window = app.get_window("splashscreen").unwrap();
            let preface_window = app.get_window("preface").unwrap();

            tauri::async_runtime::spawn(async move {
                println!("Initializing...");
                std::thread::sleep(std::time::Duration::from_secs(2));
                println!("Done initializing...");

                splashscreen_window.close().unwrap();
                preface_window.show().unwrap();
                preface_window.set_focus().unwrap();
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            preface_begin,
            get_rg_install
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
