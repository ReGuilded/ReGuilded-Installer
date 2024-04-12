// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::Write;
use std::path::Path;
use reqwest::blocking::Client;
use reqwest::header;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use crate::util::platform_handler::PlatformHandler;

mod util { pub mod platform_handler; }

#[derive(Debug, Deserialize, Serialize)]
struct Asset {
    name: String,
    browser_download_url: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct Release {
    name: String,
    tag_name: String,
    draft: bool,
    prerelease: bool,
    assets: Vec<Asset>
}

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
            Err("NO_INSTALL".into())
        }
    } else {
        Err("NOT_SUPPORTED".into())
    }
}


#[tauri::command]
fn get_rg_path() -> String {
    let platform_handler = &*PLATFORM_HANDLER.lock().unwrap();

    let platform = platform_handler.get_platform();

    platform.unwrap().reguilded_dir.to_string_lossy().to_string().into()
}

fn fetch_releases_and_save(app_handle: AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();

    let request = client.get("https://api.github.com/repos/reguilded/reguilded/releases")
        .header(header::USER_AGENT, format!("ReGuilded-Installer/{}", env!("CARGO_PKG_VERSION")));

    let response = request.send()?;

    if response.status().is_success() {
        let releases: Vec<Release> = response.json()?;

        let resource_path = app_handle.path_resolver()
            .resolve_resource("resources/releases.json")
            .expect("Failed to resolve resource.");


        let mut file = File::create(&resource_path)?;
        file.write_all(serde_json::to_string_pretty(&releases).unwrap().as_bytes()).unwrap();

        Ok(())
    } else {
        let status = response.status();
        let body = response.text()?;
        eprintln!("Failed to fetch releases. Status code: {}. Body: {}", status, body);
        Err("Failed to fetch releases".into())
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

            if let Err(err) = fetch_releases_and_save(app.handle()) {
                eprintln!("There was an error: {}", err);

                // TODO: SHOW ERROR SCREEN!

                return Err("fetch_releases_and_save errored!".into());
            }

            splashscreen_window.close().unwrap();
            preface_window.show().unwrap();
            preface_window.set_focus().unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            preface_begin,
            get_rg_install,
            get_rg_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
