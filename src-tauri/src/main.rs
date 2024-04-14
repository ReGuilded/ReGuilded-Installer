// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod util {
    pub mod platform_handler;
}
mod tasks {
    pub mod install;
}

use crate::util::platform_handler::PlatformHandler;
use reqwest::blocking::Client;
use reqwest::header;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tasks::install;
use tauri::{AppHandle, Manager};
use tauri::path::BaseDirectory;

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
    assets: Vec<Asset>,
}

pub struct DesiredRgOptions {
    rg_version: String,
    rg_path: String,
}

#[tauri::command]
fn preface_begin(window: tauri::Window) {
    let _ = window.webviews().get(0).unwrap().eval(&format!("window.location.pathname = '/{}'", "main.html"));
}

#[tauri::command]
fn get_rg_install() -> Result<(), String> {
    let platform_handler = &*PLATFORM_HANDLER.lock().unwrap();

    if let Some(platform) = platform_handler.get_platform() {
        let reguilded_asar = platform
            .reguilded_dir
            .join("reguilded.asar")
            .to_string_lossy()
            .to_string();

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

    platform
        .unwrap()
        .reguilded_dir
        .to_string_lossy()
        .to_string()
        .into()
}

#[tauri::command(rename_all = "snake_case")]
fn install_rg(desired_rg_version: &str, desired_rg_path: &str) -> Result<(), String> {
    println!(
        "RG Version: {}, RG Path: {}",
        desired_rg_version, desired_rg_path
    );

    let platform_handler = &*PLATFORM_HANDLER.lock().unwrap();
    let platform = platform_handler.get_platform();

    install::install(
        DesiredRgOptions {
            rg_version: desired_rg_version.to_string(),
            rg_path: desired_rg_path.to_string(),
        },
        platform.cloned().unwrap(),
    );

    Ok(())
}

fn fetch_releases_and_save(app_handle: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();

    let request = client
        .get("https://api.github.com/repos/reguilded/reguilded/releases")
        .header(
            header::USER_AGENT,
            format!("ReGuilded-Installer/{}", env!("CARGO_PKG_VERSION")),
        );

    let response = request.send()?;

    if response.status().is_success() {
        let releases: Vec<Release> = response.json()?;

        let resource_path = app_handle
            .path()
            .resolve("resources/releases.json", BaseDirectory::Resource)
            .expect("Failed to resolve resource.");

        let mut file = File::create(&resource_path)?;
        file.write_all(serde_json::to_string_pretty(&releases).unwrap().as_bytes())
            .unwrap();

        Ok(())
    } else {
        let status = response.status();
        let body = response.text()?;
        eprintln!(
            "Failed to fetch releases. Status code: {}. Body: {}",
            status, body
        );
        Err("Failed to fetch releases".into())
    }
}

lazy_static::lazy_static! {
    static ref PLATFORM_HANDLER: std::sync::Mutex<PlatformHandler> = std::sync::Mutex::new(PlatformHandler::new());
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let splashscreen_window = app.get_window("splashscreen").unwrap();
            let main_window = app.get_window("main").unwrap();

            if let Err(err) = fetch_releases_and_save(app.handle()) {
                eprintln!("There was an error: {}", err);

                // TODO: SHOW ERROR SCREEN!

                return Err("fetch_releases_and_save errored!".into());
            }

            splashscreen_window.close().unwrap();
            main_window.show().unwrap();
            main_window.set_focus().unwrap();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            preface_begin,
            get_rg_install,
            get_rg_path,
            install_rg
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
