import React, { createContext, useState, useContext, ReactNode } from 'react';

const translations: Record<string, Record<string, any>> = {
  en: {
    sidebar: {
      title: "LexiLaw AI",
      newChat: "New Chat",
      savedConversations: "Saved Conversations",
      settings: "Settings",
      signOut: "Sign Out",
      signIn: "Sign In"
    },
    header: {
      newChat: "New Chat",
      legalChat: "Legal Chat",
      savedConversations: "Saved Conversations",
      settings: "Settings",
      signIn: "Sign In"
    },
    home: {
      welcome: "Welcome to LexiLaw AI",
      subtitle: "Your Global Judicial AI Assistant.",
      selectCountry: "Select Country",
      inputPlaceholder: "Describe your issue, or attach a file...",
      startChat: "Start Chat",
      attachAriaLabel: "Attach a file",
      quickActions: "Or, try one of our quick actions:",
      constitutionAction: "{{countryName}}'s Constitution",
      fundamentalLawsAction: "Fundamental Laws of {{countryName}}",
      suggestionsLoading: "Fetching suggestions..."
    },
    chat: {
      backButton: "Back",
      saveButton: "Save",
      savedButton: "Saved",
      saveSuccessAlert: "Conversation saved successfully!",
      inputPlaceholder: "Ask a follow-up, or attach a file...",
      micAriaLabel: "Use microphone for voice input",
      sendAriaLabel: "Send Message",
      attachAriaLabel: "Attach a file",
      internetToggle: "Enable Internet Search",
      securityNotice: "Your conversation is private and secure. We respect your confidentiality.",
      thinking: "LexiLaw AI is thinking...",
      translating: "Translating to {{language}}...",
      errorPrefix: "Failed to get a response.",
      errorMessage: "Sorry, I encountered an error: {{errorMessage}}",
      defaultTitle: "Legal Chat",
      invalidUserMessage: "Invalid user message",
      copyResponse: "Copy",
      copied: "Copied",
      listen: "Listen",
      stopListening: "Stop",
      exportChat: "Export",
      cameraAriaLabel: "Scan document with camera",
      fileTooLarge: "File is too large. Maximum allowed size is 15 MB.",
      unsupportedFile: "Unsupported file type. Please attach an image, PDF, or text file.",
      voiceUnsupported: "Voice input is not supported in this browser."
    },
    response: {
      disclaimerTitle: "Legal Disclaimer",
      disclaimerText: "This information is for educational and advisory purposes only. It does not constitute official legal advice. Please consult a certified lawyer for sensitive or critical matters.",
      guidanceTitle: "Step-by-Step Guidance",
      portalsTitle: "Relevant Bodies & Portals",
      lawyersTitle: "Lawyer Recommendations",
      precedentsTitle: "Similar Precedents",
      sourcesTitle: "Sources",
      lawyerContact: "Contact: {{contact}}",
      lawyerRating: "Rating: {{rating}}/5"
    },
    saved: {
      title: "Saved Conversations",
      emptyTitle: "No Saved Conversations",
      emptyMessage: "Your saved legal chats will appear here.",
      loadAriaLabel: "Load conversation",
      deleteAriaLabel: "Delete conversation",
      deleteConfirm: "Are you sure you want to delete this conversation? This action cannot be undone.",
      deleteTitle: "Delete Conversation?",
      deleteConfirmButton: "Delete",
      cancelButton: "Cancel",
      searchPlaceholder: "Search saved conversations by title or country...",
      noSearchResults: "No conversations match your search.",
      exportAriaLabel: "Export conversation",
      messageCount: "{{count}} messages"
    },
    modals: {
      save: {
        title: "Save Conversation?",
        message: "You have unsaved changes. Would you like to save this conversation before leaving?",
        cancelButton: "Leave",
        confirmButton: "Save & Leave"
      },
      info: {
        closeAriaLabel: "Close modal"
      }
    },
    settings: {
        title: "Settings",
        appearance: "Appearance",
        theme: "Theme",
        themeDescription: "Change the look and feel of the app.",
        general: "General",
        notifications: "Enable Browser Notifications",
        notificationsDescription: "Receive updates right on your desktop.",
        voiceOptions: "Enable Voice Options",
        voiceDescription: "Enable voice input and output features.",
        support: "Support & About",
        about: "About LexiLaw AI",
        help: "Help Center",
        privacy: "Privacy Policy",
        contact: "Contact Us",
        permissions: "Permissions",
        camera: "Camera Access",
        cameraDescription: "Allow access to your camera.",
        microphone: "Microphone Access",
        microphoneDescription: "Allow access to your microphone for voice input.",
        geolocation: "Location Access",
        geolocationDescription: "Allow access to your location for personalized results.",
        permissionGranted: "Granted",
        permissionDenied: "Denied",
        permissionGrant: "Grant",
        permissionChecking: "Checking...",
        profileSection: "Profile & Location",
        locationLabel: "Active Location",
        locationSave: "Update Location",
        locationSaved: "Location updated"
    },
    login: {
      title: "Sign In",
      subtitle: "Sign in and provide your location to find nearby lawyers and relevant legal services.",
      namePlaceholder: "Enter your name",
      emailPlaceholder: "Enter your email",
      locationPlaceholder: "Enter your city & country (e.g., Paris, France)",
      button: "Sign In",
      error: "Failed to get location. Please enable location services and try again.",
      loading: "Signing in...",
      formError: "Please enter a valid name, email, and location."
    },
    quickActions: {
      reportCrime: { title: "Report a Crime", prompt: "I was a victim of theft. What are the general steps to report a crime to the police in my country, and what information should I typically include?"},
      onlineHarassment: { title: "Online Harassment", prompt: "I am being harassed by someone on social media. What are the common legal actions I can take to stop this?" },
      consumerRights: { title: "Consumer Rights", prompt: "I bought a faulty product. What are my consumer rights and how can I file a complaint?" },
      tenantRights: { title: "Tenant Rights", prompt: "My landlord is trying to evict me without a valid reason. What are my general rights as a tenant?" },
      workplaceIssue: { title: "Workplace Issue", prompt: "My employer has not paid my salary. What are the typical legal steps I can take to recover my dues?" },
      freedomOfInformation: { title: "Freedom of Information", prompt: "How can I request information from a government department under freedom of information laws?" },
    }
  },
  es: { // Spanish
    sidebar: { title: "LexiLaw AI", newChat: "Nuevo chat", savedConversations: "Chats guardados", settings: "Ajustes", signOut: "Cerrar sesión", signIn: "Iniciar Sesión" },
    header: { newChat: "Nuevo chat", legalChat: "Chat legal", savedConversations: "Conversaciones guardadas", settings: "Ajustes", signIn: "Iniciar Sesión" },
    home: { welcome: "Bienvenido a LexiLaw AI", subtitle: "Tu Asistente Judicial Global de IA.", selectCountry: "Seleccionar país", inputPlaceholder: "Describe tu problema o adjunta un archivo...", startChat: "Iniciar chat", attachAriaLabel: "Adjuntar un archivo", quickActions: "O prueba una de nuestras acciones rápidas:", constitutionAction: "Constitución de {{countryName}}", fundamentalLawsAction: "Leyes Fundamentales de {{countryName}}", suggestionsLoading: "Buscando sugerencias..." },
    chat: { backButton: "Atrás", saveButton: "Guardar", savedButton: "Guardado", saveSuccessAlert: "¡Conversación guardada con éxito!", inputPlaceholder: "Haz una pregunta o adjunta un archivo...", micAriaLabel: "Usar micrófono para entrada de voz", sendAriaLabel: "Enviar mensaje", attachAriaLabel: "Adjuntar un archivo", internetToggle: "Habilitar Búsqueda en Internet", securityNotice: "Su conversación es privada y segura. Respetamos su confidencialidad.", thinking: "LexiLaw AI está pensando...", translating: "Traduciendo al {{language}}...", errorPrefix: "No se pudo obtener una respuesta.", errorMessage: "Lo siento, encontré un error: {{errorMessage}}", defaultTitle: "Chat Legal", invalidUserMessage: "Mensaje de usuario inválido" },
    response: { disclaimerTitle: "Aviso Legal", disclaimerText: "Esta información es solo para fines educativos y de asesoramiento. No constituye un consejo legal oficial. Consulte a un abogado certificado para asuntos críticos.", guidanceTitle: "Guía Paso a Paso", portalsTitle: "Organismos y Portales Relevantes", lawyersTitle: "Recomendaciones de Abogados", precedentsTitle: "Precedentes Similares", sourcesTitle: "Fuentes", lawyerContact: "Contacto: {{contact}}", lawyerRating: "Calificación: {{rating}}/5" },
    saved: { title: "Conversaciones guardadas", emptyTitle: "No hay conversaciones guardadas", emptyMessage: "Tus chats legales guardados aparecerán aquí.", loadAriaLabel: "Cargar conversación", deleteAriaLabel: "Eliminar conversación", deleteConfirm: "¿Está seguro de que desea eliminar esta conversación? Esta acción no se puede deshacer." },
    modals: { save: { title: "¿Guardar conversación?", message: "Tiene cambios sin guardar. ¿Le gustaría guardar esta conversación antes de salir?", cancelButton: "Salir", confirmButton: "Guardar y Salir" }, info: { closeAriaLabel: "Cerrar modal" } },
    settings: { title: "Ajustes", appearance: "Apariencia", theme: "Tema", themeDescription: "Cambia el aspecto de la aplicación.", general: "General", notifications: "Habilitar notificaciones del navegador", notificationsDescription: "Recibe actualizaciones en tu escritorio.", voiceOptions: "Habilitar opciones de voz", voiceDescription: "Habilita las funciones de entrada y salida de voz.", support: "Soporte y Acerca de", about: "Acerca de LexiLaw AI", help: "Centro de ayuda", privacy: "Política de privacidad", contact: "Contáctenos", permissions: "Permisos", camera: "Acceso a la cámara", cameraDescription: "Permitir acceso a tu cámara.", microphone: "Acceso al micrófono", microphoneDescription: "Permitir acceso a tu micrófono.", geolocation: "Acceso a la ubicación", geolocationDescription: "Permitir acceso a tu ubicación.", permissionGranted: "Concedido", permissionDenied: "Denegado", permissionGrant: "Conceder", permissionChecking: "Verificando..." },
    login: { title: "Iniciar Sesión", subtitle: "Inicie sesión y proporcione su ubicación para encontrar abogados cercanos y servicios legales relevantes.", namePlaceholder: "Introduce tu nombre", emailPlaceholder: "Introduce tu correo electrónico", locationPlaceholder: "Introduce tu ciudad y país (ej. Madrid, España)", button: "Iniciar sesión", error: "No se pudo obtener la ubicación. Habilite los servicios de ubicación y vuelva a intentarlo.", loading: "Iniciando sesión...", formError: "Por favor, introduce un nombre, correo electrónico y ubicación válidos." },
    quickActions: { reportCrime: { title: "Denunciar un delito", prompt: "Fui víctima de un robo. ¿Cuáles son los pasos generales para denunciar un delito a la policía en mi país y qué información debo incluir?" }, onlineHarassment: { title: "Acoso en línea", prompt: "Alguien me está acosando en las redes sociales. ¿Qué acciones legales comunes puedo tomar para detener esto?" }, consumerRights: { title: "Derechos del consumidor", prompt: "Compré un producto defectuoso. ¿Cuáles son mis derechos como consumidor y cómo puedo presentar una queja?" }, tenantRights: { title: "Derechos del inquilino", prompt: "Mi arrendador está tratando de desalojarme sin una razón válida. ¿Cuáles son mis derechos generales como inquilino?" }, workplaceIssue: { title: "Problema en el trabajo", prompt: "Mi empleador no me ha pagado el salario. ¿Qué pasos legales típicos puedo tomar para recuperar mis deudas?" }, freedomOfInformation: { title: "Libertad de información", prompt: "¿Cómo puedo solicitar información a un departamento gubernamental bajo las leyes de libertad de información?" }, }
  },
  fr: { // French
    sidebar: { title: "LexiLaw AI", newChat: "Nouveau Chat", savedConversations: "Conversations", settings: "Paramètres", signOut: "Se déconnecter", signIn: "Se connecter" },
    header: { newChat: "Nouveau Chat", legalChat: "Chat Juridique", savedConversations: "Conversations", settings: "Paramètres", signIn: "Se connecter" },
    home: { welcome: "Bienvenue chez LexiLaw AI", subtitle: "Votre assistant judiciaire IA mondial.", selectCountry: "Sélectionner le pays", inputPlaceholder: "Décrivez votre problème juridique pour commencer...", startChat: "Démarrer le chat", attachAriaLabel: "Joindre un fichier", quickActions: "Ou, essayez l'une de nos actions rapides:", constitutionAction: "Constitution de {{countryName}}", fundamentalLawsAction: "Lois fondamentales de {{countryName}}", suggestionsLoading: "Recherche de suggestions..." },
    chat: { backButton: "Retour", saveButton: "Sauvegarder", savedButton: "Enregistré", saveSuccessAlert: "Conversation sauvegardée avec succès!", inputPlaceholder: "Posez une question de suivi...", micAriaLabel: "Utiliser le microphone", sendAriaLabel: "Envoyer", attachAriaLabel: "Joindre un fichier", internetToggle: "Activer la recherche Internet", securityNotice: "Votre conversation est privée et sécurisée.", thinking: "LexiLaw AI réfléchit...", translating: "Traduction en {{language}}...", errorPrefix: "Échec de la réponse.", errorMessage: "Désolé, une erreur est survenue: {{errorMessage}}", defaultTitle: "Chat Juridique" },
    response: { disclaimerTitle: "Avis de non-responsabilité légale", disclaimerText: "Ces informations sont fournies à des fins éducatives et consultatives uniquement. Veuillez consulter un avocat certifié.", guidanceTitle: "Guide étape par étape", portalsTitle: "Organismes et portails pertinents", lawyersTitle: "Recommandations d'avocats", precedentsTitle: "Précédents similaires", sourcesTitle: "Sources", lawyerContact: "Contact: {{contact}}", lawyerRating: "Évaluation: {{rating}}/5" },
    saved: { title: "Conversations enregistrées", emptyTitle: "Aucune conversation enregistrée", emptyMessage: "Vos conversations enregistrées apparaîtront ici.", loadAriaLabel: "Charger la conversation", deleteAriaLabel: "Supprimer la conversation", deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette conversation?" },
    modals: { save: { title: "Sauvegarder?", message: "Vous avez des modifications non sauvegardées.", cancelButton: "Quitter", confirmButton: "Sauvegarder et quitter" }, info: { closeAriaLabel: "Fermer" } },
    settings: { title: "Paramètres", appearance: "Apparence", theme: "Thème", themeDescription: "Changez l'apparence de l'application.", general: "Général", notifications: "Activer les notifications", notificationsDescription: "Recevez des mises à jour.", voiceOptions: "Activer les options vocales", voiceDescription: "Activez les fonctionnalités vocales.", support: "Support", about: "À propos de LexiLaw AI", help: "Aide", privacy: "Politique de confidentialité", contact: "Contactez-nous", permissions: "Autorisations", camera: "Accès caméra", cameraDescription: "Autoriser l'accès à la caméra.", microphone: "Accès microphone", microphoneDescription: "Autoriser l'accès au microphone.", geolocation: "Accès à la localisation", geolocationDescription: "Autoriser l'accès à votre position.", permissionGranted: "Accordé", permissionDenied: "Refusé", permissionGrant: "Accorder", permissionChecking: "Vérification..." },
    login: { title: "Se connecter", subtitle: "Connectez-vous pour trouver des avocats à proximité.", namePlaceholder: "Entrez votre nom", emailPlaceholder: "Entrez votre email", locationPlaceholder: "Entrez votre ville et pays", button: "Se connecter", error: "Échec de la connexion.", loading: "Connexion...", formError: "Veuillez entrer des informations valides." },
    quickActions: { reportCrime: { title: "Signaler un crime", prompt: "J'ai été victime d'un vol. Quelles sont les étapes pour signaler un crime ?" }, onlineHarassment: { title: "Harcèlement en ligne", prompt: "Je suis harcelé en ligne. Que puis-je faire ?" }, consumerRights: { title: "Droits des consommateurs", prompt: "J'ai acheté un produit défectueux. Quels sont mes droits ?" }, tenantRights: { title: "Droits des locataires", prompt: "Mon propriétaire essaie de m'expulser. Quels sont mes droits ?" }, workplaceIssue: { title: "Problème au travail", prompt: "Mon employeur ne m'a pas payé. Que faire ?" }, freedomOfInformation: { title: "Liberté d'information", prompt: "Comment demander des informations au gouvernement ?" } }
  },
  hi: { // Hindi
    sidebar: { title: "लेक्सीलॉ एआई", newChat: "नई चैट", savedConversations: "सहेजी गई चैट", settings: "सेटिंग्स", signOut: "साइन आउट करें", signIn: "साइन इन करें" },
    header: { newChat: "नई चैट", legalChat: "कानूनी चैट", savedConversations: "सहेजी गई चैट", settings: "सेटिंग्स", signIn: "साइन इन करें" },
    home: { welcome: "लेक्सीलॉ एआई में आपका स्वागत है", subtitle: "आपका वैश्विक न्यायिक एआई सहायक।", selectCountry: "देश चुनें", inputPlaceholder: "अपनी समस्या का वर्णन करें...", startChat: "चैट शुरू करें", attachAriaLabel: "फ़ाइल संलग्न करें", quickActions: "या, हमारे त्वरित कार्यों में से एक का प्रयास करें:", constitutionAction: "{{countryName}} का संविधान", fundamentalLawsAction: " {{countryName}} के मौलिक कानून", suggestionsLoading: "सुझाव लाए जा रहे हैं..." },
    chat: { backButton: "वापस", saveButton: "सहेजें", savedButton: "सहेजा गया", saveSuccessAlert: "बातचीत सफलतापूर्वक सहेजी गई!", inputPlaceholder: "आगे का प्रश्न पूछें...", micAriaLabel: "माइक्रोफ़ोन का उपयोग करें", sendAriaLabel: "भेजें", attachAriaLabel: "फ़ाइल संलग्न करें", internetToggle: "इंटरनेट खोज सक्षम करें", securityNotice: "आपकी बातचीत निजी और सुरक्षित है।", thinking: "लेक्सीलॉ एआई सोच रहा है...", translating: "{{language}} में अनुवाद हो रहा है...", errorPrefix: "प्रतिक्रिया प्राप्त करने में विफल।", errorMessage: "क्षमा करें, एक त्रुटि हुई: {{errorMessage}}", defaultTitle: "कानूनी चैट" },
    response: { disclaimerTitle: "कानूनी अस्वीकरण", disclaimerText: "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। कृपया महत्वपूर्ण मामलों के लिए एक वकील से परामर्श करें।", guidanceTitle: "चरण-दर-चरण मार्गदर्शन", portalsTitle: "प्रासंगिक निकाय और पोर्टल", lawyersTitle: "वकील की सिफारिशें", precedentsTitle: "समान उदाहरण", sourcesTitle: "स्रोत", lawyerContact: "संपर्क: {{contact}}", lawyerRating: "रेटिंग: {{rating}}/5" },
    saved: { title: "सहेजी गई बातचीत", emptyTitle: "कोई सहेजी गई बातचीत नहीं", emptyMessage: "आपकी सहेजी गई बातचीत यहाँ दिखाई देगी।", loadAriaLabel: "बातचीत लोड करें", deleteAriaLabel: "बातचीत हटाएं", deleteConfirm: "क्या आप वाकई इस बातचीत को हटाना चाहते हैं?" },
    modals: { save: { title: "बातचीत सहेजें?", message: "आपने बदलावों को सहेजा नहीं है।", cancelButton: "छोड़ दें", confirmButton: "सहेजें और छोड़ दें" }, info: { closeAriaLabel: "बंद करें" } },
    settings: { title: "सेटिंग्स", appearance: "दिखावट", theme: "थीम", themeDescription: "ऐप का रूप बदलें।", general: "सामान्य", notifications: "सूचनाएं सक्षम करें", notificationsDescription: "अपडेट प्राप्त करें।", voiceOptions: "आवाज विकल्प सक्षम करें", voiceDescription: "आवाज सुविधाएँ सक्षम करें।", support: "समर्थन", about: "लेक्सीलॉ एआई के बारे में", help: "सहायता", privacy: "गोपनीयता नीति", contact: "संपर्क करें", permissions: "अनुमतियाँ", camera: "कैमरा एक्सेस", cameraDescription: "कैमरे तक पहुंच की अनुमति दें।", microphone: "माइक्रोफ़ोन एक्सेस", microphoneDescription: "माइक्रोफ़ोन तक पहुंच की अनुमति दें।", geolocation: "स्थान एक्सेस", geolocationDescription: "अपने स्थान तक पहुंच की अनुमति दें।", permissionGranted: "अनुमति दी गई", permissionDenied: "अस्वीकृत", permissionGrant: "अनुमति दें", permissionChecking: "जाँच हो रही है..." },
    login: { title: "साइन इन करें", subtitle: "आस-पास के वकीलों को खोजने के लिए साइन इन करें।", namePlaceholder: "अपना नाम दर्ज करें", emailPlaceholder: "अपना ईमेल दर्ज करें", locationPlaceholder: "अपना शहर और देश दर्ज करें", button: "साइन इन करें", error: "लॉग इन करने में विफल।", loading: "साइन इन हो रहा है...", formError: "कृपया मान्य विवरण दर्ज करें।" },
    quickActions: { reportCrime: { title: "अपराध की रिपोर्ट करें", prompt: "मैं चोरी का शिकार हुआ था। अपराध की रिपोर्ट करने के लिए क्या कदम हैं?" }, onlineHarassment: { title: "ऑनलाइन उत्पीड़न", prompt: "मुझे ऑनलाइन परेशान किया जा रहा है। मैं क्या कर सकता हूँ?" }, consumerRights: { title: "उपभोक्ता अधिकार", prompt: "मैंने एक दोषपूर्ण उत्पाद खरीदा। मेरे अधिकार क्या हैं?" }, tenantRights: { title: "किरायेदार के अधिकार", prompt: "मेरा मकान मालिक मुझे बेदखल करने की कोशिश कर रहा है। मेरे अधिकार क्या हैं?" }, workplaceIssue: { title: "कार्यस्थल का मुद्दा", prompt: "मेरे नियोक्ता ने मेरा वेतन नहीं दिया है। क्या करें?" }, freedomOfInformation: { title: "सूचना की स्वतंत्रता", prompt: "मैं सरकारी विभाग से जानकारी कैसे मांग सकता हूँ?" } }
  },
  ja: { // Japanese
    sidebar: { title: "LexiLaw AI", newChat: "新しいチャット", savedConversations: "保存された会話", settings: "設定", signOut: "サインアウト", signIn: "サインイン" },
    header: { newChat: "新しいチャット", legalChat: "リーガルチャット", savedConversations: "保存された会話", settings: "設定", signIn: "サインイン" },
    home: { welcome: "LexiLaw AIへようこそ", subtitle: "あなたのグローバルな司法AIアシスタント。", selectCountry: "国を選択", inputPlaceholder: "あなたの問題を説明してください...", startChat: "チャットを開始", attachAriaLabel: "ファイルを添付", quickActions: "または、クイックアクションをお試しください:", constitutionAction: "{{countryName}}の憲法", fundamentalLawsAction: "{{countryName}}の基本法", suggestionsLoading: "提案を取得しています..." },
    chat: { backButton: "戻る", saveButton: "保存", savedButton: "保存済み", saveSuccessAlert: "会話が正常に保存されました！", inputPlaceholder: "フォローアップの質問をする...", micAriaLabel: "マイクを使用", sendAriaLabel: "送信", attachAriaLabel: "ファイルを添付", internetToggle: "インターネット検索を有効にする", securityNotice: "あなたの会話は非公開で安全です。", thinking: "LexiLaw AIは考えています...", translating: "{{language}}に翻訳しています...", errorPrefix: "応答の取得に失敗しました。", errorMessage: "申し訳ありません、エラーが発生しました: {{errorMessage}}", defaultTitle: "リーガルチャット" },
    response: { disclaimerTitle: "法的免責事項", disclaimerText: "この情報は教育目的のものです。重要な問題については弁護士にご相談ください。", guidanceTitle: "ステップバイステップガイダンス", portalsTitle: "関連機関とポータル", lawyersTitle: "弁護士の推薦", precedentsTitle: "類似の判例", sourcesTitle: "情報源", lawyerContact: "連絡先: {{contact}}", lawyerRating: "評価: {{rating}}/5" },
    saved: { title: "保存された会話", emptyTitle: "保存された会話はありません", emptyMessage: "保存した会話はここに表示されます。", loadAriaLabel: "会話を読み込む", deleteAriaLabel: "会話を削除", deleteConfirm: "この会話を削除してもよろしいですか？" },
    modals: { save: { title: "会話を保存しますか？", message: "保存されていない変更があります。", cancelButton: "終了", confirmButton: "保存して終了" }, info: { closeAriaLabel: "閉じる" } },
    settings: { title: "設定", appearance: "外観", theme: "テーマ", themeDescription: "アプリの外観を変更します。", general: "全般", notifications: "通知を有効にする", notificationsDescription: "更新情報を受け取る。", voiceOptions: "音声オプションを有効にする", voiceDescription: "音声機能を有効にします。", support: "サポート", about: "LexiLaw AIについて", help: "ヘルプ", privacy: "プライバシーポリシー", contact: "お問い合わせ", permissions: "権限", camera: "カメラアクセス", cameraDescription: "カメラへのアクセスを許可します。", microphone: "マイクアクセス", microphoneDescription: "マイクへのアクセスを許可します。", geolocation: "位置情報アクセス", geolocationDescription: "位置情報へのアクセスを許可します。", permissionGranted: "許可されました", permissionDenied: "拒否されました", permissionGrant: "許可する", permissionChecking: "確認中..." },
    login: { title: "サインイン", subtitle: "サインインして近くの弁護士を見つけます。", namePlaceholder: "名前を入力", emailPlaceholder: "メールアドレスを入力", locationPlaceholder: "都市と国を入力", button: "サインイン", error: "ログインに失敗しました。", loading: "サインインしています...", formError: "有効な情報を入力してください。" },
    quickActions: { reportCrime: { title: "犯罪を報告する", prompt: "私は盗難の被害に遭いました。犯罪を報告するための手順は何ですか？" }, onlineHarassment: { title: "オンラインハラスメント", prompt: "オンラインで嫌がらせを受けています。どうすればいいですか？" }, consumerRights: { title: "消費者の権利", prompt: "不良品を買いました。私の権利は何ですか？" }, tenantRights: { title: "借主の権利", prompt: "家主が私を立ち退かせようとしています。私の権利は何ですか？" }, workplaceIssue: { title: "職場の問題", prompt: "雇用主が給料を払ってくれません。どうすればいいですか？" }, freedomOfInformation: { title: "情報公開", prompt: "政府部門に情報を請求するにはどうすればいいですか？" } }
  },
  pt: { // Portuguese
    sidebar: { title: "LexiLaw AI", newChat: "Novo Chat", savedConversations: "Conversas Salvas", settings: "Configurações", signOut: "Sair", signIn: "Entrar" },
    header: { newChat: "Novo Chat", legalChat: "Chat Jurídico", savedConversations: "Conversas Salvas", settings: "Configurações", signIn: "Entrar" },
    home: { welcome: "Bem-vindo ao LexiLaw AI", subtitle: "Seu Assistente Jurídico Global de IA.", selectCountry: "Selecione o país", inputPlaceholder: "Descreva seu problema...", startChat: "Iniciar Chat", attachAriaLabel: "Anexar arquivo", quickActions: "Ou, tente uma de nossas ações rápidas:", constitutionAction: "Constituição de {{countryName}}", fundamentalLawsAction: "Leis Fundamentais de {{countryName}}", suggestionsLoading: "Buscando sugestões..." },
    chat: { backButton: "Voltar", saveButton: "Salvar", savedButton: "Salvo", saveSuccessAlert: "Conversa salva com sucesso!", inputPlaceholder: "Faça uma pergunta de acompanhamento...", micAriaLabel: "Usar microfone", sendAriaLabel: "Enviar", attachAriaLabel: "Anexar arquivo", internetToggle: "Habilitar Pesquisa na Internet", securityNotice: "Sua conversa é privada e segura.", thinking: "LexiLaw AI está pensando...", translating: "Traduzindo para {{language}}...", errorPrefix: "Falha ao obter resposta.", errorMessage: "Desculpe, ocorreu um erro: {{errorMessage}}", defaultTitle: "Chat Jurídico" },
    response: { disclaimerTitle: "Aviso Legal", disclaimerText: "Esta informação é para fins educacionais. Consulte um advogado para assuntos importantes.", guidanceTitle: "Guia Passo a Passo", portalsTitle: "Órgãos e Portais Relevantes", lawyersTitle: "Recomendações de Advogados", precedentsTitle: "Precedentes Semelhantes", sourcesTitle: "Fontes", lawyerContact: "Contato: {{contact}}", lawyerRating: "Avaliação: {{rating}}/5" },
    saved: { title: "Conversas Salvas", emptyTitle: "Nenhuma Conversa Salva", emptyMessage: "Suas conversas salvas aparecerão aqui.", loadAriaLabel: "Carregar conversa", deleteAriaLabel: "Deletar conversa", deleteConfirm: "Tem certeza que deseja deletar esta conversa?" },
    modals: { save: { title: "Salvar conversa?", message: "Você tem alterações não salvas.", cancelButton: "Sair", confirmButton: "Salvar e Sair" }, info: { closeAriaLabel: "Fechar" } },
    settings: { title: "Configurações", appearance: "Aparência", theme: "Tema", themeDescription: "Mude a aparência do aplicativo.", general: "Geral", notifications: "Habilitar notificações", notificationsDescription: "Receba atualizações.", voiceOptions: "Habilitar opções de voz", voiceDescription: "Habilite os recursos de voz.", support: "Suporte", about: "Sobre o LexiLaw AI", help: "Ajuda", privacy: "Política de Privacidade", contact: "Contato", permissions: "Permissões", camera: "Acesso à câmera", cameraDescription: "Permitir acesso à sua câmera.", microphone: "Acesso ao microfone", microphoneDescription: "Permitir acesso ao seu microfone.", geolocation: "Acesso à localização", geolocationDescription: "Permitir acesso à sua localização.", permissionGranted: "Permitido", permissionDenied: "Negado", permissionGrant: "Permitir", permissionChecking: "Verificando..." },
    login: { title: "Entrar", subtitle: "Entre para encontrar advogados próximos.", namePlaceholder: "Digite seu nome", emailPlaceholder: "Digite seu email", locationPlaceholder: "Digite sua cidade e país", button: "Entrar", error: "Falha ao fazer login.", loading: "Entrando...", formError: "Por favor, insira informações válidas." },
    quickActions: { reportCrime: { title: "Denunciar um crime", prompt: "Fui vítima de um roubo. Quais são os passos para denunciar um crime?" }, onlineHarassment: { title: "Assédio online", prompt: "Estou sofrendo assédio online. O que posso fazer?" }, consumerRights: { title: "Direitos do consumidor", prompt: "Comprei um produto com defeito. Quais são meus direitos?" }, tenantRights: { title: "Direitos do inquilino", prompt: "Meu senhorio está tentando me despejar. Quais são meus direitos?" }, workplaceIssue: { title: "Problema no trabalho", prompt: "Meu empregador não me pagou. O que fazer?" }, freedomOfInformation: { title: "Liberdade de informação", prompt: "Como posso solicitar informações do governo?" } }
  },
  ru: { // Russian
    sidebar: { title: "LexiLaw AI", newChat: "Новый чат", savedConversations: "Сохраненные чаты", settings: "Настройки", signOut: "Выйти", signIn: "Войти" },
    header: { newChat: "Новый чат", legalChat: "Юридический чат", savedConversations: "Сохраненные чаты", settings: "Настройки", signIn: "Войти" },
    home: { welcome: "Добро пожаловать в LexiLaw AI", subtitle: "Ваш глобальный судебный ИИ-помощник.", selectCountry: "Выберите страну", inputPlaceholder: "Опишите вашу проблему...", startChat: "Начать чат", attachAriaLabel: "Прикрепить файл", quickActions: "Или попробуйте одно из быстрых действий:", constitutionAction: "Конституция {{countryName}}", fundamentalLawsAction: "Основные законы {{countryName}}", suggestionsLoading: "Поиск предложений..." },
    chat: { backButton: "Назад", saveButton: "Сохранить", savedButton: "Сохранено", saveSuccessAlert: "Чат успешно сохранен!", inputPlaceholder: "Задайте следующий вопрос...", micAriaLabel: "Использовать микрофон", sendAriaLabel: "Отправить", attachAriaLabel: "Прикрепить файл", internetToggle: "Включить поиск в Интернете", securityNotice: "Ваш разговор конфиденциален и безопасен.", thinking: "LexiLaw AI думает...", translating: "Перевод на {{language}}...", errorPrefix: "Не удалось получить ответ.", errorMessage: "Извините, произошла ошибка: {{errorMessage}}", defaultTitle: "Юридический чат" },
    response: { disclaimerTitle: "Правовая оговорка", disclaimerText: "Эта информация предназначена для образовательных целей. По важным вопросам проконсультируйтесь с юристом.", guidanceTitle: "Пошаговое руководство", portalsTitle: "Соответствующие органы и порталы", lawyersTitle: "Рекомендации юристов", precedentsTitle: "Похожие прецеденты", sourcesTitle: "Источники", lawyerContact: "Контакт: {{contact}}", lawyerRating: "Рейтинг: {{rating}}/5" },
    saved: { title: "Сохраненные чаты", emptyTitle: "Нет сохраненных чатов", emptyMessage: "Ваши сохраненные чаты появятся здесь.", loadAriaLabel: "Загрузить чат", deleteAriaLabel: "Удалить чат", deleteConfirm: "Вы уверены, что хотите удалить этот чат?" },
    modals: { save: { title: "Сохранить чат?", message: "У вас есть несохраненные изменения.", cancelButton: "Выйти", confirmButton: "Сохранить и выйти" }, info: { closeAriaLabel: "Закрыть" } },
    settings: { title: "Настройки", appearance: "Внешний вид", theme: "Тема", themeDescription: "Изменить внешний вид приложения.", general: "Общие", notifications: "Включить уведомления", notificationsDescription: "Получать обновления.", voiceOptions: "Включить голосовые опции", voiceDescription: "Включить голосовые функции.", support: "Поддержка", about: "О LexiLaw AI", help: "Помощь", privacy: "Политика конфиденциальности", contact: "Контакты", permissions: "Разрешения", camera: "Доступ к камере", cameraDescription: "Разрешить доступ к камере.", microphone: "Доступ к микрофону", microphoneDescription: "Разрешить доступ к микрофону.", geolocation: "Доступ к местоположению", geolocationDescription: "Разрешить доступ к вашему местоположению.", permissionGranted: "Предоставлено", permissionDenied: "Отклонено", permissionGrant: "Предоставить", permissionChecking: "Проверка..." },
    login: { title: "Войти", subtitle: "Войдите, чтобы найти юристов поблизости.", namePlaceholder: "Введите ваше имя", emailPlaceholder: "Введите ваш email", locationPlaceholder: "Введите ваш город и страну", button: "Войти", error: "Ошибка входа.", loading: "Вход...", formError: "Пожалуйста, введите корректные данные." },
    quickActions: { reportCrime: { title: "Сообщить о преступлении", prompt: "Я стал жертвой кражи. Каковы шаги для сообщения о преступлении?" }, onlineHarassment: { title: "Преследование в сети", prompt: "Меня преследуют в сети. Что я могу сделать?" }, consumerRights: { title: "Права потребителей", prompt: "Я купил бракованный товар. Каковы мои права?" }, tenantRights: { title: "Права арендатора", prompt: "Мой арендодатель пытается меня выселить. Каковы мои права?" }, workplaceIssue: { title: "Проблема на работе", prompt: "Мой работодатель не выплатил мне зарплату. Что делать?" }, freedomOfInformation: { title: "Свобода информации", prompt: "Как я могу запросить информацию у госорганов?" } }
  },
  ta: { // Tamil
    sidebar: { title: "லெக்ஸிலா AI", newChat: "புதிய அரட்டை", savedConversations: "சேமித்தவை", settings: "அமைப்புகள்", signOut: "வெளியேறு", signIn: "உள்நுழை" },
    header: { newChat: "புதிய அரட்டை", legalChat: "சட்ட அரட்டை", savedConversations: "சேமித்தவை", settings: "அமைப்புகள்", signIn: "உள்நுழை" },
    home: { welcome: "லெக்ஸிலா AI-க்கு வரவேற்கிறோம்", subtitle: "உங்கள் உலகளாவிய நீதித்துறை AI உதவியாளர்.", selectCountry: "நாட்டைத் தேர்ந்தெடுக்கவும்", inputPlaceholder: "உங்கள் சிக்கலை விவரிக்கவும்...", startChat: "அரட்டையைத் தொடங்கு", attachAriaLabel: "கோப்பை இணைக்கவும்", quickActions: "அல்லது, எங்கள் விரைவான செயல்களில் ஒன்றை முயற்சிக்கவும்:", constitutionAction: "{{countryName}} அரசியலமைப்பு", fundamentalLawsAction: "{{countryName}} அடிப்படைச் சட்டங்கள்", suggestionsLoading: "பரிந்துரைகளைப் பெறுகிறது..." },
    chat: { backButton: "பின்செல்", saveButton: "சேமி", savedButton: "சேமிக்கப்பட்டது", saveSuccessAlert: "உரையாடல் வெற்றிகரமாக சேமிக்கப்பட்டது!", inputPlaceholder: "ஒரு பின்தொடர்தல் கேள்வியைக் கேளுங்கள்...", micAriaLabel: "மைக்ரோஃபோனைப் பயன்படுத்தவும்", sendAriaLabel: "அனுப்பு", attachAriaLabel: "கோப்பை இணைக்கவும்", internetToggle: "இணையத் தேடலை இயக்கு", securityNotice: "உங்கள் உரையாடல் தனிப்பட்டது மற்றும் பாதுகாப்பானது.", thinking: "லெக்ஸிலா AI சிந்தித்து வருகிறது...", translating: "{{language}}க்கு மொழிபெயர்க்கப்படுகிறது...", errorPrefix: "பதிலைப் பெற முடியவில்லை.", errorMessage: "மன்னிக்கவும், ஒரு பிழை ஏற்பட்டது: {{errorMessage}}", defaultTitle: "சட்ட அரட்டை" },
    response: { disclaimerTitle: "சட்ட மறுப்பு", disclaimerText: "இந்தத் தகவல் கல்வி நோக்கங்களுக்காக மட்டுமே. முக்கியமான விஷயங்களுக்கு வழக்கறிஞரை அணுகவும்.", guidanceTitle: "படிப்படியான வழிகாட்டுதல்", portalsTitle: "தொடர்புடைய அமைப்புகள்", lawyersTitle: "வழக்கறிஞர் பரிந்துரைகள்", precedentsTitle: "ஒத்த முன்மாதிரிகள்", sourcesTitle: "ஆதாரங்கள்", lawyerContact: "தொடர்புக்கு: {{contact}}", lawyerRating: "மதிப்பீடு: {{rating}}/5" },
    saved: { title: "சேமித்த உரையாடல்கள்", emptyTitle: "சேமித்த உரையாடல்கள் இல்லை", emptyMessage: "நீங்கள் சேமித்த உரையாடல்கள் இங்கே தோன்றும்.", loadAriaLabel: "உரையாடலை ஏற்றவும்", deleteAriaLabel: "உரையாடலை நீக்கு", deleteConfirm: "இந்த உரையாடலை நீக்க விரும்புகிறீர்களா?" },
    modals: { save: { title: "உரையாடலைச் சேமிக்கவா?", message: "நீங்கள் சேமிக்கப்படாத மாற்றங்களைக் கொண்டுள்ளீர்கள்.", cancelButton: "வெளியேறு", confirmButton: "சேமித்து வெளியேறு" }, info: { closeAriaLabel: "மூடு" } },
    settings: { title: "அமைப்புகள்", appearance: "தோற்றம்", theme: "தீம்", themeDescription: "பயன்பாட்டின் தோற்றத்தை மாற்றவும்.", general: "பொது", notifications: "அறிவிப்புகளை இயக்கு", notificationsDescription: "புதுப்பிப்புகளைப் பெறுங்கள்.", voiceOptions: "குரல் விருப்பங்களை இயக்கு", voiceDescription: "குரல் அம்சங்களை இயக்கு.", support: "ஆதரவு", about: "லெக்ஸிலா AI பற்றி", help: "உதவி", privacy: "தனியுரிமைக் கொள்கை", contact: "தொடர்புக்கு", permissions: "அனுமதிகள்", camera: "கேமரா அணுகல்", cameraDescription: "கேமரா அணுகலை அனுமதிக்கவும்.", microphone: "மைக்ரோஃபோன் அணுகல்", microphoneDescription: "மைக்ரோஃபோன் அணுகலை அனுமதிக்கவும்.", geolocation: "இருப்பிட அணுகல்", geolocationDescription: "உங்கள் இருப்பிடத்தை அணுக அனுமதிக்கவும்.", permissionGranted: "வழங்கப்பட்டது", permissionDenied: "மறுக்கப்பட்டது", permissionGrant: "அனுமதி", permissionChecking: "சரிபார்க்கிறது..." },
    login: { title: "உள்நுழை", subtitle: "அருகிலுள்ள வழக்கறிஞர்களைக் கண்டுபிடிக்க உள்நுழையவும்.", namePlaceholder: "உங்கள் பெயரை உள்ளிடவும்", emailPlaceholder: "உங்கள் மின்னஞ்சலை உள்ளிடவும்", locationPlaceholder: "உங்கள் நகரம் மற்றும் நாட்டை உள்ளிடவும்", button: "உள்நுழை", error: "உள்நுழைவதில் தோல்வி.", loading: "உள்நுழைகிறது...", formError: "தயவுசெய்து சரியான விவரங்களை உள்ளிடவும்." },
    quickActions: { reportCrime: { title: "குற்றத்தைப் புகாரளி", prompt: "நான் ஒரு திருட்டுக்கு ஆளானேன். குற்றத்தைப் புகாரளிக்க என்ன படிகள்?" }, onlineHarassment: { title: "ஆன்லைன் துன்புறுத்தல்", prompt: "நான் ஆன்லைனில் துன்புறுத்தப்படுகிறேன். நான் என்ன செய்ய முடியும்?" }, consumerRights: { title: "நுகர்வோர் உரிமைகள்", prompt: "நான் ஒரு குறைபாடுள்ள பொருளை வாங்கினேன். என் உரிமைகள் என்ன?" }, tenantRights: { title: "குத்தகைதாரர் உரிமைகள்", prompt: "என் வீட்டு உரிமையாளர் என்னை வெளியேற்ற முயற்சிக்கிறார். என் உரிமைகள் என்ன?" }, workplaceIssue: { title: "பணி இடப் பிரச்சினை", prompt: "என் முதலாளி என் சம்பளத்தை வழங்கவில்லை. என்ன செய்வது?" }, freedomOfInformation: { title: "தகவல் அறியும் உரிமை", prompt: "அரசுத் துறையிலிருந்து தகவலை நான் எவ்வாறு கோர முடியும்?" } }
  },
  zh: { // Chinese
    sidebar: { title: "LexiLaw AI", newChat: "新的聊天", savedConversations: "已保存的对话", settings: "设置", signOut: "登出", signIn: "登录" },
    header: { newChat: "新的聊天", legalChat: "法律聊天", savedConversations: "已保存的对话", settings: "设置", signIn: "登录" },
    home: { welcome: "欢迎来到 LexiLaw AI", subtitle: "您的全球司法AI助手。", selectCountry: "选择国家", inputPlaceholder: "描述您的问题...", startChat: "开始聊天", attachAriaLabel: "附加文件", quickActions: "或者，尝试我们的快速操作之一：", constitutionAction: "{{countryName}}宪法", fundamentalLawsAction: "{{countryName}}基本法", suggestionsLoading: "正在获取建议..." },
    chat: { backButton: "返回", saveButton: "保存", savedButton: "已保存", saveSuccessAlert: "对话已成功保存！", inputPlaceholder: "提出后续问题...", micAriaLabel: "使用麦克风", sendAriaLabel: "发送", attachAriaLabel: "附加文件", internetToggle: "启用互联网搜索", securityNotice: "您的对话是私密且安全的。", thinking: "LexiLaw AI 正在思考...", translating: "正在翻译成 {{language}}...", errorPrefix: "获取回复失败。", errorMessage: "抱歉，发生了错误：{{errorMessage}}", defaultTitle: "法律聊天" },
    response: { disclaimerTitle: "法律免责声明", disclaimerText: "此信息仅供教育目的。对于重要事项，请咨询律师。", guidanceTitle: "分步指南", portalsTitle: "相关机构和门户", lawyersTitle: "律师建议", precedentsTitle: "类似判例", sourcesTitle: "来源", lawyerContact: "联系方式: {{contact}}", lawyerRating: "评分: {{rating}}/5" },
    saved: { title: "已保存的对话", emptyTitle: "没有已保存的对话", emptyMessage: "您保存的对话将显示在此处。", loadAriaLabel: "加载对话", deleteAriaLabel: "删除对话", deleteConfirm: "您确定要删除此对话吗？" },
    modals: { save: { title: "保存对话？", message: "您有未保存的更改。", cancelButton: "离开", confirmButton: "保存并离开" }, info: { closeAriaLabel: "关闭" } },
    settings: { title: "设置", appearance: "外观", theme: "主题", themeDescription: "更改应用程序的外观。", general: "通用", notifications: "启用通知", notificationsDescription: "接收更新。", voiceOptions: "启用语音选项", voiceDescription: "启用语音功能。", support: "支持", about: "关于 LexiLaw AI", help: "帮助", privacy: "隐私政策", contact: "联系我们", permissions: "权限", camera: "相机访问", cameraDescription: "允许访问相机。", microphone: "麦克风访问", microphoneDescription: "允许访问麦克风。", geolocation: "位置访问", geolocationDescription: "允许访问您的位置。", permissionGranted: "已授予", permissionDenied: "已拒绝", permissionGrant: "授予", permissionChecking: "正在检查..." },
    login: { title: "登录", subtitle: "登录以查找附近的律师。", namePlaceholder: "输入您的姓名", emailPlaceholder: "输入您的电子邮件", locationPlaceholder: "输入您所在的城市和国家", button: "登录", error: "登录失败。", loading: "正在登录...", formError: "请输入有效信息。" },
    quickActions: { reportCrime: { title: "报案", prompt: "我被盗了。报案的步骤是什么？" }, onlineHarassment: { title: "网络骚扰", prompt: "我在网上受到骚扰。我该怎么办？" }, consumerRights: { title: "消费者权益", prompt: "我买到了有缺陷的产品。我有什么权利？" }, tenantRights: { title: "租户权利", prompt: "房东想赶我走。我有什么权利？" }, workplaceIssue: { title: "工作场所问题", prompt: "雇主没有付我工资。怎么办？" }, freedomOfInformation: { title: "信息自由", prompt: "我如何向政府部门索取信息？" } }
  }
};


interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'lexilaw_locale';

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      return localStorage.getItem(LOCALE_STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLocale = (nextLocale: string) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // ignore storage errors
    }
  };
  
  const t = (key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let translation = translations[locale] || translations['en'];
    let fallback = translations['en'];

    let currentTranslation: any = translation;
    for (const k of keys) {
        if (currentTranslation && typeof currentTranslation === 'object' && k in currentTranslation) {
            currentTranslation = currentTranslation[k];
        } else {
            currentTranslation = undefined;
            break;
        }
    }
    
    if (currentTranslation === undefined) {
        let currentFallback: any = fallback;
        for (const k of keys) {
            if (currentFallback && typeof currentFallback === 'object' && k in currentFallback) {
                currentFallback = currentFallback[k];
            } else {
                currentFallback = key; // Fallback to key if not found
                break;
            }
        }
        currentTranslation = currentFallback;
    }
    
    let result = currentTranslation as string;

    if (typeof result === 'string' && options) {
      Object.keys(options).forEach(optKey => {
        result = result.replace(new RegExp(`{{${optKey}}}`, 'g'), String(options[optKey]));
      });
    }
    return result;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useTranslation = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }
  return context;
};