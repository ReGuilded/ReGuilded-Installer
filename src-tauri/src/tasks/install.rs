use crate::util::platform_handler::Platform;
use crate::DesiredRgOptions;
use runas::Command;
use std::fs::{create_dir, File};
use std::io::Write;
use std::path::{Path, PathBuf};

fn check_write_permission(folder_path: String) -> bool {
    let temp_file_path = format!("{}/.tmp_write_permission_check", folder_path);

    match File::create(&temp_file_path) {
        Ok(mut file) => {
            if let Err(_) = file.write_all(b"test") {
                return false;
            }

            if let Err(_) = std::fs::remove_file(&temp_file_path) {
                return false;
            }

            true
        }
        Err(_) => false,
    }
}

fn create_rg_directory(rg_directory: PathBuf, is_permitted: bool) -> Result<(), String> {
    println!(
        "Directory to create: {}",
        rg_directory.to_string_lossy().to_string()
    );

    println!("{}", is_permitted);

    // TODO: FIX FOR LINUX & MACOS
    if is_permitted {
        println!("IS PERMITTED, CREATING DIR");
        create_dir(&rg_directory).map_err(|e| e.to_string())?;
    } else {
        if ["linux", "macos"].contains(&std::env::consts::OS) {
            let status = Command::new("mkdir")
                .arg(rg_directory.to_string_lossy().to_string())
                .status()
                .map_err(|e| e.to_string())?;
        } else if std::env::consts::OS == "windows" {
            let status = Command::new("cmd.exe")
                .arg("/c")
                .arg("mkdir")
                .arg(rg_directory.to_string_lossy().to_string())
                .status()
                .map_err(|e| e.to_string())?;

            if !status.success() {
                return Err("Failed to create directory.".into());
            }
        }
    };

    Ok(())
}

pub fn install(desired_rg_options: DesiredRgOptions, user_platform: Platform) {
    let mut is_permitted: bool = false;
    let mut rg_path_exists: bool = false;
    let mut dir_to_test: PathBuf;

    let rg_path_buf = PathBuf::from(desired_rg_options.rg_path);
    let parent_dir = rg_path_buf.join("..");

    /*
       Test if the Desired RG Directory exits,
       if it does: we will test the permissions on that directory.
       If it doesn't: we will test the permission on the parent directory.
    */
    if Path::new(&rg_path_buf).exists() {
        dir_to_test = rg_path_buf.clone();
        rg_path_exists = true;
    } else {
        dir_to_test = parent_dir;
        rg_path_exists = false;
    }

    if check_write_permission(dir_to_test.to_string_lossy().to_string()) {
        is_permitted = true;
    } else {
        is_permitted = false;
    }

    if !rg_path_exists {
        if let Err(err) = create_rg_directory(rg_path_buf.clone(), is_permitted) {
            eprintln!("There was an error! {}", err)
        }
    }

    // println!("User has permission: {}", is_permitted);
}
