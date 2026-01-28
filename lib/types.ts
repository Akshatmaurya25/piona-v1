export interface Service {
  id: string
  user_id: string | null
  name: string
  description: string | null
  embedding_method: string
  api_key: string
  created_at: string
}

export interface WidgetConfig {
  primaryColor: string
  backgroundColor: string
  textColor: string
  userBubbleColor: string
  botBubbleColor: string
  accentColor: string
  fontFamily: string
}

export interface Source {
  id: string
  service_id: string
  name: string
  file_type: "csv" | "excel"
  file_path: string
  status: "pending" | "processing" | "completed" | "failed"
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Chunk {
  id: string
  source_id: string
  service_id: string
  content: string
  chunk_index: number
  metadata: Record<string, unknown>
}

export interface ChatMessage {
  id: string
  service_id: string
  session_id: string
  role: "user" | "assistant"
  content: string
  prompt_used: string | null
  context_used: string | null
  chunks_used: string[]
  created_at: string
}

export interface Feedback {
  id: string
  chat_message_id: string
  service_id: string
  feedback_type: "like" | "dislike" | "correction"
  correction_message: string | null
  expected_response: string | null
  created_at: string
}

export interface WritingStyle {
  id: string
  service_id: string
  name: string
  description: string | null
  tone: string | null
  guidelines: string | null
  is_default: boolean
}

export interface StyleExample {
  id: string
  style_id: string
  example_input: string
  example_output: string
}
