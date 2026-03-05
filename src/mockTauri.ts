if (!(window as any).__TAURI_INTERNALS__) {
  console.log("Mocking Tauri IPC for browser preview...");
  (window as any).__TAURI_OS_PLUGIN_INTERNALS__ = {
    platform: "windows",
    version: "10",
    family: "windows",
    arch: "x86_64",
    exe_extension: "exe",
    eol: "\r\n"
  };
  (window as any).__TAURI_INTERNALS__ = {
    invoke: async (cmd: string, args: any) => {
      console.log(`[Tauri Mock] invoke: ${cmd}`, args);
      
      switch (cmd) {
        case "has_any_models_available":
          return true;
        case "get_app_settings":
          return {
            bindings: {},
            push_to_talk: false,
            always_on_microphone: true,
            sound_theme: "marimba",
            overlay_position: "bottom"
          };
        case "get_default_settings":
          return {};
        case "check_custom_sounds":
          return { start: false, stop: false };
        case "get_available_models":
          return [
            {
               id: "model1",
               name: "Parakeet V3",
               description: "Fast and reliable",
               filename: "model.bin",
               size_mb: 100,
               is_downloaded: true,
               is_downloading: false,
               partial_size: 0,
               is_directory: false,
               engine_type: "Parakeet",
               accuracy_score: 95,
               speed_score: 95,
               supports_translation: false,
               is_recommended: true,
               supported_languages: ["en"],
               is_custom: false
            }
          ];
        case "get_current_model":
          return "model1";
        case "get_history_entries":
          return [
            {
                id: 1,
                text: "Schedule a meeting with the design team tomorrow morning.",
                timestamp: Date.now(),
                transcription_text: "Schedule a meeting with the design team tomorrow morning.",
                saved: false,
                title: "",
                post_processed_text: null,
                post_process_prompt: null
            },
            {
                id: 2,
                text: "Send the updated UI prototype to the developer channel and ask for feedback on the new layout.",
                timestamp: Date.now() - 86400000,
                transcription_text: "Send the updated UI prototype to the developer channel and ask for feedback on the new layout.",
                saved: false,
                title: "",
                post_processed_text: null,
                post_process_prompt: null
            }
          ];
        case "get_available_microphones":
        case "get_available_output_devices":
          return [];
        case "is_recording":
          return false;
        case "plugin:event|listen":
          return 1;
        case "plugin:event|unlisten":
          return;
        default:
          return null;
      }
    },
    transformCallback: () => 1,
    convertFileSrc: (path: string) => path,
  };
}
