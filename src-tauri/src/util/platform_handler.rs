use std::path::PathBuf;

#[derive(Clone)]
pub struct Platform {
    pub guilded_app_name: String,
    pub reguilded_dir: PathBuf,
    pub guilded_dir: PathBuf,
}

impl Platform {
    fn new(guilded_app_name: &str, reguilded_dir: &str, guilded_dir: &str) -> Self {
        Self {
            guilded_app_name: guilded_app_name.to_string(),
            reguilded_dir: PathBuf::from(reguilded_dir),
            guilded_dir: PathBuf::from(guilded_dir),
        }
    }
}

pub struct PlatformHandler {
    platform: Option<Platform>,
    platform_set: bool
}

impl PlatformHandler {
    pub fn new() -> Self {
        let mut platforms = std::collections::HashMap::<String, Platform>::new();
        platforms.insert("linux".to_string(), Platform::new("guilded", "/usr/local/share/ReGuilded", "/opt/Guilded"));
        platforms.insert("macos".to_string(), Platform::new("guilded", "/Applications/ReGuilded", "/Applications/Guilded.app"));
        platforms.insert("windows".to_string(),
                         Platform::new("Guilded",
                                       &std::env::var("ProgramW6432")
                                           .map(|path| path + "\\ReGuilded")
                                           .unwrap_or_default(),
                                       &std::env::var("LOCALAPPDATA")
                                           .map(|path| path + "\\Programs\\Guilded")
                                           .unwrap_or_default(),
                         ),
        );

        let platform = platforms.get(std::env::consts::OS).cloned();
        let platform_set = platform.is_some();

        Self { platform, platform_set }
    }

    pub fn get_platform(&self) -> Option<&Platform> {
        self.platform.as_ref()
    }

    // pub fn set_platform(&mut self, platform: Platform) {
    //     self.platform = Some(platform);
    //     self.platform_set = true;
    // }

    pub fn is_platform_set(&self) -> bool {
        self.platform_set
    }
}