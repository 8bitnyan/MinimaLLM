class ChatMessage {
  final String text;
  final bool isUser;
  final bool isError;
  final List<Map<String, dynamic>>? sources;

  ChatMessage({
    required this.text,
    required this.isUser,
    this.isError = false,
    this.sources,
  });
}
