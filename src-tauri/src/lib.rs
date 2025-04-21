// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use minisoft_compiler::run_compiler;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::command;

#[command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Hello world from Rust! Current epoch: {}", epoch_ms)
}

#[command]
fn compile_minisoft(file_path: String, verbose: bool) -> Result<String, String> {
  run_compiler(&file_path, verbose)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![greet, compile_minisoft])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
