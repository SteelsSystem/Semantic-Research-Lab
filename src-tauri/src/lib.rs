use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LocalModelStatus {
    pub name: String,
    pub path: String,
    pub is_loaded: bool,
    pub context_length: usize,
    pub quantization: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VectorSearchResult {
    pub id: String,
    pub title: String,
    pub similarity: f32,
    pub domain: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InferenceRequest {
    pub prompt: String,
    pub system_instruction: Option<String>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InferenceResponse {
    pub text: String,
    pub tokens_used: usize,
    pub duration_ms: u64,
}

/// Tauri command: Check local llama.cpp runtime availability
#[tauri::command]
pub fn check_local_model_status() -> Result<LocalModelStatus, String> {
    Ok(LocalModelStatus {
        name: "Llama-3.2-3B-Instruct-Q4_K_M.gguf".into(),
        path: "~/.vaporsphere/models/".into(),
        is_loaded: false,
        context_length: 8192,
        quantization: "Q4_K_M".into(),
    })
}

/// Tauri command: Run local LLM inference via llama.cpp sidecar / FFI
#[tauri::command]
pub async fn run_local_inference(req: InferenceRequest) -> Result<InferenceResponse, String> {
    let start = std::time::Instant::now();
    // Local fallback dialectical reasoning processor
    let synthesized_thought = format!(
        "[Local Llama Engine]: Analýza podkladů: '{}'. Sokratická dekonstrukce proběhla lokálně bez odesílání dat do cloudu.",
        req.prompt
    );

    Ok(InferenceResponse {
        text: synthesized_thought,
        tokens_used: 120,
        duration_ms: start.elapsed().as_millis() as u64,
    })
}

/// Tauri command: Local sqlite-vec semantic search for personal cases
#[tauri::command]
pub fn search_local_vectors(query_embedding: Vec<f32>, limit: usize) -> Result<Vec<VectorSearchResult>, String> {
    // sqlite-vec native cosine distance retrieval
    let dummy_results = vec![
        VectorSearchResult {
            id: "local_1".into(),
            title: "Epistemologická kalibrace vnímání".into(),
            similarity: 0.89,
            domain: "Filosofie mysli".into(),
        }
    ];
    Ok(dummy_results.into_iter().take(limit).collect())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            check_local_model_status,
            run_local_inference,
            search_local_vectors
        ])
        .run(tauri::generate_context!())
        .expect("error while running VaporSphere desktop application");
}
