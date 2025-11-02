// ========================================
// TEMPLATE PDF - Export de conversation
// ========================================
// 📖 Explication simple :
// Ce fichier définit la structure et le design du PDF exporté.
// Utilise @react-pdf/renderer pour générer un PDF élégant.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Styles du PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #16a34a",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  messageContainer: {
    marginBottom: 20,
  },
  userMessage: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  assistantMessage: {
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeft: "3 solid #16a34a",
  },
  messageHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  messageText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#374151",
  },
  timestamp: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

type Message = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
};

type ChatPDFDocumentProps = {
  chatTitle: string;
  messages: Message[];
  exportDate: string;
};

export function ChatPDFDocument({
  chatTitle,
  messages,
  exportDate,
}: ChatPDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>🌿 {chatTitle}</Text>
          <Text style={styles.subtitle}>
            Conversation - Agent Endobiogénie
          </Text>
          <Text style={styles.subtitle}>
            Exporté le {exportDate} • {messages.length} message
            {messages.length > 1 ? "s" : ""}
          </Text>
        </View>

        {/* Messages */}
        <View>
          {messages.map((message, index) => (
            <View key={message.id} style={styles.messageContainer}>
              <View
                style={
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                <Text style={styles.messageHeader}>
                  {message.role === "user" ? "👤 Vous" : "🤖 Assistant"}
                </Text>
                <Text style={styles.messageText}>{message.content}</Text>
                <Text style={styles.timestamp}>
                  {new Date(message.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pied de page */}
        <View style={styles.footer} fixed>
          <Text>
            Généré par Agent Endobiogénie • endobiogenie-rag.vercel.app
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
