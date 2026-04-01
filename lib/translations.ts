export const translations = {
  nl: {
    // Header
    appName: "FeatureHub",
    logout: "Uitloggen",
    
    // Roles
    roles: {
      USER: "Gebruiker",
      SUPPORT: "Product Support",
      ADMIN: "Product Admin",
      VIEWER: "Viewer",
    },
    
    // Sidebar
    sidebar: {
      dashboard: "Dashboard",
      newRequest: "Nieuw Verzoek",
      myRequests: "Mijn Verzoeken",
      reviewQueue: "Beoordelingswachtrij",
      finalReview: "Definitieve Beoordeling",
      allRequests: "Alle Verzoeken",
      analytics: "Analyse",
      categories: "Categorieën",
      users: "Gebruikers",
      help: "Help",
    },
    
    // Status labels
    status: {
      SUBMITTED: "Ingediend",
      UNDER_REVIEW: "In Beoordeling",
      FINAL_REVIEW: "Definitieve Beoordeling",
      ACCEPTED: "Geaccepteerd",
      DECLINED: "Afgewezen",
      RETURNED: "Teruggestuurd",
    },
    
    // Priority labels
    priority: {
      LOW: "Laag",
      MEDIUM: "Gemiddeld",
      HIGH: "Hoog",
      CRITICAL: "Kritiek",
    },
    
    // Common
    common: {
      back: "Terug",
      cancel: "Annuleren",
      save: "Opslaan",
      submit: "Indienen",
      delete: "Verwijderen",
      edit: "Bewerken",
      editRequest: "Verzoek Bewerken",
      view: "Bekijken",
      search: "Zoeken",
      filter: "Filter",
      loading: "Laden...",
      noResults: "Geen resultaten gevonden",
      submittedOn: "Ingediend op",
      requestedBy: "Aangevraagd door",
      submittedBy: "Ingediend door",
      attachments: "Bijlagen",
      allStatuses: "Alle Statussen",
      allPriorities: "Alle Prioriteiten",
      returnedNote: "Dit verzoek is teruggestuurd. Bekijk de notitie hieronder en pas uw verzoek aan.",
    },
    
    // Forms
    form: {
      title: "Titel",
      description: "Beschrijving",
      businessJustification: "Zakelijke Onderbouwing",
      reason: "Waarom is dit nodig?",
      category: "Categorie",
      selectCategory: "Selecteer een categorie...",
      requestedByField: "Aangevraagd door",
      requestedByPlaceholder: "Naam van de persoon die dit verzoek heeft aangevraagd",
      requestedByHelp: "Vul de naam in van de persoon namens wie u dit verzoek indient.",
      titlePlaceholder: "Korte, beschrijvende titel voor uw verzoek",
      descriptionPlaceholder: "Beschrijf de functie in detail. Wat moet het doen? Hoe moet het werken?",
      businessJustificationPlaceholder: "Welke zakelijke waarde brengt dit? Hoe beïnvloedt het omzet, efficiëntie of klanttevredenheid?",
      reasonPlaceholder: "Leg de pijnpunten of problemen uit die deze functie zou oplossen.",
      required: "verplicht",
    },
    
    // AI Assist
    ai: {
      suggestion: "AI Suggestie",
      improve: "AI Verbeteren",
      applySuggestion: "Suggestie Toepassen",
      close: "Sluiten",
      generating: "Suggestie wordt gegenereerd...",
      applied: "AI-suggestie toegepast!",
      suggestionFor: "AI Suggestie voor",
    },
    
    // Upload
    upload: {
      attachments: "Bijlagen",
      clickToUpload: "Klik om screenshots of documenten te uploaden",
      uploadSuccess: "Bestanden succesvol geüpload",
      uploadError: "Fout bij uploaden bestanden",
    },
    
    // Messages
    messages: {
      submitSuccess: "Functieverzoek succesvol ingediend!",
      submitError: "Fout bij indienen verzoek",
      updateSuccess: "Verzoek succesvol bijgewerkt!",
      updateError: "Fout bij bijwerken verzoek",
      titleDescriptionRequired: "Titel en beschrijving zijn verplicht",
      noteAdded: "Notitie toegevoegd",
      noteError: "Fout bij toevoegen notitie",
    },
    
    // Dashboard
    dashboard: {
      welcome: "Welkom",
      recentRequests: "Recente Verzoeken",
      pendingReview: "Wacht op Beoordeling",
      totalRequests: "Totaal Verzoeken",
      acceptedRequests: "Geaccepteerd",
      declinedRequests: "Afgewezen",
      noRequestsYet: "Nog geen verzoeken",
      noRequestsToReview: "Geen verzoeken te beoordelen",
      submitFirstRequest: "Dien Uw Eerste Verzoek In",
    },
    
    // Review
    review: {
      openRequests: "Openstaande Verzoeken",
      selectPriority: "Selecteer een prioriteitsniveau",
      submitToAdmin: "Indienen voor Admin",
      supportNotes: "Support Notities",
      adminNotes: "Admin Notities",
      declineReason: "Reden afwijzing",
      accept: "Accepteren",
      decline: "Afwijzen",
      returnToSupport: "Terugsturen naar Support",
      moreInfoNeeded: "Meer Info Nodig",
      new: "Nieuw",
      waitingForDecision: "Wacht op Beslissing",
      noRequestsPending: "Geen verzoeken in afwachting van beoordeling",
      allProcessed: "Alle verzoeken zijn verwerkt. Kijk later terug.",
      accepted: "Verzoek geaccepteerd!",
      declined: "Verzoek afgewezen",
      returnedToSupport: "Verzoek teruggestuurd naar support",
    },
    
    // Analytics
    analytics: {
      title: "Analyse Dashboard",
      requestsByStatus: "Verzoeken per Status",
      requestsByCategory: "Verzoeken per Categorie",
      requestsByPriority: "Verzoeken per Prioriteit",
      requestsOverTime: "Verzoeken over Tijd",
      avgProcessingTime: "Gem. Verwerkingstijd",
      days: "dagen",
    },
    
    // Categories
    categories: {
      title: "Categorieën Beheren",
      addNew: "Nieuwe Categorie",
      name: "Naam",
      description: "Beschrijving",
      color: "Kleur",
      requestCount: "Verzoeken",
      noCategories: "Nog geen categorieën",
      created: "Categorie aangemaakt!",
      updated: "Categorie bijgewerkt!",
      deleted: "Categorie verwijderd!",
    },
    
    // Login/Signup
    auth: {
      login: "Inloggen",
      signup: "Registreren",
      email: "E-mailadres",
      password: "Wachtwoord",
      confirmPassword: "Wachtwoord bevestigen",
      name: "Volledige naam",
      rememberMe: "Onthoud mij",
      forgotPassword: "Wachtwoord vergeten?",
      noAccount: "Nog geen account?",
      haveAccount: "Heeft u al een account?",
      loginError: "Ongeldige inloggegevens",
      signupError: "Registratie mislukt",
    },
    
    // Help
    help: {
      title: "Help & Handleiding",
      overview: "Overzicht",
      overviewText: "FeatureHub stelt u in staat om functieverzoeken in te dienen, te beoordelen en te volgen. Elk verzoek doorloopt een gestructureerd workflow: Indiening → Support Beoordeling → Admin Beoordeling → Geaccepteerd of Afgewezen.",
      yourRole: "Uw Rol",
      workflowTitle: "Hoe werkt het?",
      workflowSteps: [
        { step: "1. Indiening", desc: "Een gebruiker dient een functieverzoek in met titel, beschrijving, zakelijke onderbouwing en optionele bijlagen." },
        { step: "2. Support Beoordeling", desc: "Product Support beoordeelt het verzoek, stelt een prioriteit in en voegt notities toe voordat het naar de Admin gaat." },
        { step: "3. Admin Beoordeling", desc: "De Product Admin neemt de definitieve beslissing: accepteren, afwijzen of terugsturen naar Support voor meer informatie." },
      ],
      rolesTitle: "Rollen uitleg",
      roleDescriptions: {
        USER: "U kunt nieuwe functieverzoeken indienen, uw eigen verzoeken volgen en de analysepagina bekijken. Gebruik de AI-assistent om betere verzoeken te schrijven.",
        SUPPORT: "U beoordeelt ingediende verzoeken, stelt prioriteiten in, voegt notities toe en stuurt verzoeken door naar de Product Admin voor definitieve beoordeling.",
        ADMIN: "U neemt de definitieve beslissing over functieverzoeken (accepteren, afwijzen of terugsturen). U beheert ook categorieën en gebruikers.",
        VIEWER: "U heeft alleen-lezen toegang tot het dashboard, alle verzoeken en de analysepagina.",
      },
      tipsTitle: "Handige tips",
      tips: [
        "Gebruik de AI-assistent bij het schrijven van een verzoek voor betere formulering.",
        "Voeg bijlagen toe (screenshots, documenten) om uw verzoek te verduidelijken.",
        "Gebruik de taalschakelaar om tussen Nederlands en Engels te wisselen.",
        "Gebruik filters en zoekfuncties om snel verzoeken terug te vinden.",
      ],
      statusTitle: "Statusoverzicht",
      statusDescriptions: {
        SUBMITTED: "Het verzoek is ingediend en wacht op beoordeling door Support.",
        UNDER_REVIEW: "Support heeft het verzoek beoordeeld en doorgestuurd naar de Admin.",
        FINAL_REVIEW: "De Admin beoordeelt het verzoek voor de definitieve beslissing.",
        ACCEPTED: "Het verzoek is goedgekeurd en zal worden opgepakt.",
        DECLINED: "Het verzoek is afgewezen.",
        RETURNED: "Het verzoek is teruggestuurd naar Support voor meer informatie.",
      },
    },

    // Landing page
    landing: {
      title: "FeatureHub",
      subtitle: "Dien uw functieverzoeken in en volg de voortgang",
      getStarted: "Aan de slag",
      learnMore: "Meer informatie",
    },
  },
  
  en: {
    // Header
    appName: "FeatureHub",
    logout: "Log out",
    
    // Roles
    roles: {
      USER: "User",
      SUPPORT: "Product Support",
      ADMIN: "Product Admin",
      VIEWER: "Viewer",
    },
    
    // Sidebar
    sidebar: {
      dashboard: "Dashboard",
      newRequest: "New Request",
      myRequests: "My Requests",
      reviewQueue: "Review Queue",
      finalReview: "Final Review",
      allRequests: "All Requests",
      analytics: "Analytics",
      categories: "Categories",
      users: "Users",
      help: "Help",
    },
    
    // Status labels
    status: {
      SUBMITTED: "Submitted",
      UNDER_REVIEW: "Under Review",
      FINAL_REVIEW: "Final Review",
      ACCEPTED: "Accepted",
      DECLINED: "Declined",
      RETURNED: "Returned",
    },
    
    // Priority labels
    priority: {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "Critical",
    },
    
    // Common
    common: {
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      submit: "Submit",
      delete: "Delete",
      edit: "Edit",
      editRequest: "Edit Request",
      view: "View",
      search: "Search",
      filter: "Filter",
      loading: "Loading...",
      noResults: "No results found",
      submittedOn: "Submitted on",
      requestedBy: "Requested by",
      submittedBy: "Submitted by",
      attachments: "Attachments",
      allStatuses: "All Statuses",
      allPriorities: "All Priorities",
      returnedNote: "This request has been returned. Please review the note below and update your request.",
    },
    
    // Forms
    form: {
      title: "Title",
      description: "Description",
      businessJustification: "Business Justification",
      reason: "Why is this needed?",
      category: "Category",
      selectCategory: "Select a category...",
      requestedByField: "Requested by",
      requestedByPlaceholder: "Name of the person who requested this",
      requestedByHelp: "Enter the name of the person on whose behalf you are submitting this request.",
      titlePlaceholder: "Short, descriptive title for your request",
      descriptionPlaceholder: "Describe the feature in detail. What should it do? How should it work?",
      businessJustificationPlaceholder: "What business value does this bring? How does it affect revenue, efficiency or customer satisfaction?",
      reasonPlaceholder: "Explain the pain points or problems this feature would solve.",
      required: "required",
    },
    
    // AI Assist
    ai: {
      suggestion: "AI Suggestion",
      improve: "AI Improve",
      applySuggestion: "Apply Suggestion",
      close: "Close",
      generating: "Generating suggestion...",
      applied: "AI suggestion applied!",
      suggestionFor: "AI Suggestion for",
    },
    
    // Upload
    upload: {
      attachments: "Attachments",
      clickToUpload: "Click to upload screenshots or documents",
      uploadSuccess: "Files uploaded successfully",
      uploadError: "Error uploading files",
    },
    
    // Messages
    messages: {
      submitSuccess: "Feature request submitted successfully!",
      submitError: "Error submitting request",
      updateSuccess: "Request updated successfully!",
      updateError: "Error updating request",
      titleDescriptionRequired: "Title and description are required",
      noteAdded: "Note added",
      noteError: "Error adding note",
    },
    
    // Dashboard
    dashboard: {
      welcome: "Welcome",
      recentRequests: "Recent Requests",
      pendingReview: "Pending Review",
      totalRequests: "Total Requests",
      acceptedRequests: "Accepted",
      declinedRequests: "Declined",
      noRequestsYet: "No requests yet",
      noRequestsToReview: "No requests to review",
      submitFirstRequest: "Submit Your First Request",
    },
    
    // Review
    review: {
      openRequests: "Open Requests",
      selectPriority: "Select a priority level",
      submitToAdmin: "Submit to Admin",
      supportNotes: "Support Notes",
      adminNotes: "Admin Notes",
      declineReason: "Decline reason",
      accept: "Accept",
      decline: "Decline",
      returnToSupport: "Return to Support",
      moreInfoNeeded: "More Info Needed",
      new: "New",
      waitingForDecision: "Waiting for Decision",
      noRequestsPending: "No requests pending review",
      allProcessed: "All requests have been processed. Check back later.",
      accepted: "Request accepted!",
      declined: "Request declined",
      returnedToSupport: "Request returned to support",
    },
    
    // Analytics
    analytics: {
      title: "Analytics Dashboard",
      requestsByStatus: "Requests by Status",
      requestsByCategory: "Requests by Category",
      requestsByPriority: "Requests by Priority",
      requestsOverTime: "Requests over Time",
      avgProcessingTime: "Avg. Processing Time",
      days: "days",
    },
    
    // Categories
    categories: {
      title: "Manage Categories",
      addNew: "New Category",
      name: "Name",
      description: "Description",
      color: "Colour",
      requestCount: "Requests",
      noCategories: "No categories yet",
      created: "Category created!",
      updated: "Category updated!",
      deleted: "Category deleted!",
    },
    
    // Login/Signup
    auth: {
      login: "Log in",
      signup: "Sign up",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      name: "Full name",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      loginError: "Invalid credentials",
      signupError: "Sign up failed",
    },
    
    // Help
    help: {
      title: "Help & Guide",
      overview: "Overview",
      overviewText: "FeatureHub allows you to submit, review and track feature requests. Each request follows a structured workflow: Submission → Support Review → Admin Review → Accepted or Declined.",
      yourRole: "Your Role",
      workflowTitle: "How does it work?",
      workflowSteps: [
        { step: "1. Submission", desc: "A user submits a feature request with a title, description, business justification and optional attachments." },
        { step: "2. Support Review", desc: "Product Support reviews the request, sets a priority and adds notes before forwarding it to the Admin." },
        { step: "3. Admin Review", desc: "The Product Admin makes the final decision: accept, decline or return to Support for more information." },
      ],
      rolesTitle: "Roles explained",
      roleDescriptions: {
        USER: "You can submit new feature requests, track your own requests and view the analytics page. Use the AI assistant to write better requests.",
        SUPPORT: "You review submitted requests, set priorities, add notes and forward requests to the Product Admin for final review.",
        ADMIN: "You make the final decision on feature requests (accept, decline or return). You also manage categories and users.",
        VIEWER: "You have read-only access to the dashboard, all requests and the analytics page.",
      },
      tipsTitle: "Helpful tips",
      tips: [
        "Use the AI assistant when writing a request for better phrasing.",
        "Add attachments (screenshots, documents) to clarify your request.",
        "Use the language switcher to switch between Dutch and English.",
        "Use filters and search functions to quickly find requests.",
      ],
      statusTitle: "Status overview",
      statusDescriptions: {
        SUBMITTED: "The request has been submitted and is awaiting review by Support.",
        UNDER_REVIEW: "Support has reviewed the request and forwarded it to the Admin.",
        FINAL_REVIEW: "The Admin is reviewing the request for the final decision.",
        ACCEPTED: "The request has been approved and will be picked up.",
        DECLINED: "The request has been declined.",
        RETURNED: "The request has been returned to Support for more information.",
      },
    },

    // Landing page
    landing: {
      title: "FeatureHub",
      subtitle: "Submit your feature requests and track their progress",
      getStarted: "Get Started",
      learnMore: "Learn More",
    },
  },

  de: {
    // Header
    appName: "FeatureHub",
    logout: "Abmelden",
    
    // Roles
    roles: {
      USER: "Benutzer",
      SUPPORT: "Produktsupport",
      ADMIN: "Produkt-Admin",
      VIEWER: "Betrachter",
    },
    
    // Sidebar
    sidebar: {
      dashboard: "Dashboard",
      newRequest: "Neue Anfrage",
      myRequests: "Meine Anfragen",
      reviewQueue: "Warteschlange für Überprüfungen",
      finalReview: "Endgültige Überprüfung",
      allRequests: "Alle Anfragen",
      analytics: "Analysen",
      categories: "Kategorien",
      users: "Benutzer",
      help: "Hilfe",
    },
    
    // Status labels
    status: {
      SUBMITTED: "Eingereicht",
      UNDER_REVIEW: "In Überprüfung",
      FINAL_REVIEW: "Endgültige Überprüfung",
      ACCEPTED: "Akzeptiert",
      DECLINED: "Abgelehnt",
      RETURNED: "Zurückgesendet",
    },
    
    // Priority labels
    priority: {
      LOW: "Niedrig",
      MEDIUM: "Mittel",
      HIGH: "Hoch",
      CRITICAL: "Kritisch",
    },
    
    // Common
    common: {
      back: "Zurück",
      cancel: "Abbrechen",
      save: "Speichern",
      submit: "Einreichen",
      delete: "Löschen",
      edit: "Bearbeiten",
      editRequest: "Anfrage bearbeiten",
      view: "Ansicht",
      search: "Suche",
      filter: "Filter",
      loading: "Wird geladen...",
      noResults: "Keine Ergebnisse gefunden",
      submittedOn: "Eingereicht am",
      requestedBy: "Angefordert von",
      submittedBy: "Eingereicht von",
      attachments: "Anhänge",
      allStatuses: "Alle Status",
      allPriorities: "Alle Prioritäten",
      returnedNote: "Diese Anfrage wurde zurückgesendet. Bitte überprüfen Sie die Notiz unten und aktualisieren Sie Ihre Anfrage.",
    },
    
    // Forms
    form: {
      title: "Titel",
      description: "Beschreibung",
      businessJustification: "Geschäftliche Begründung",
      reason: "Warum wird das benötigt?",
      category: "Kategorie",
      selectCategory: "Kategorie auswählen...",
      requestedByField: "Angefordert von",
      requestedByPlaceholder: "Name der Person, die dies angefordert hat",
      requestedByHelp: "Geben Sie den Namen der Person ein, in deren Namen Sie diese Anfrage einreichen.",
      titlePlaceholder: "Kurzer, aussagekräftiger Titel für Ihre Anfrage",
      descriptionPlaceholder: "Beschreiben Sie die Funktion im Detail. Was soll sie tun? Wie soll sie funktionieren?",
      businessJustificationPlaceholder: "Welchen geschäftlichen Wert bringt dies? Wie wirkt es sich auf Umsatz, Effizienz oder Kundenzufriedenheit aus?",
      reasonPlaceholder: "Erklären Sie die Schmerzpunkte oder Probleme, die diese Funktion lösen würde.",
      required: "erforderlich",
    },
    
    // AI Assist
    ai: {
      suggestion: "KI-Vorschlag",
      improve: "KI Verbessern",
      applySuggestion: "Vorschlag anwenden",
      close: "Schließen",
      generating: "Vorschlag wird generiert...",
      applied: "KI-Vorschlag angewendet!",
      suggestionFor: "KI-Vorschlag für",
    },
    
    // Upload
    upload: {
      attachments: "Anhänge",
      clickToUpload: "Klicken Sie zum Hochladen von Screenshots oder Dokumenten",
      uploadSuccess: "Dateien erfolgreich hochgeladen",
      uploadError: "Fehler beim Hochladen von Dateien",
    },
    
    // Messages
    messages: {
      submitSuccess: "Funktionsanfrage erfolgreich eingereicht!",
      submitError: "Fehler beim Einreichen der Anfrage",
      updateSuccess: "Anfrage erfolgreich aktualisiert!",
      updateError: "Fehler beim Aktualisieren der Anfrage",
      titleDescriptionRequired: "Titel und Beschreibung sind erforderlich",
      noteAdded: "Notiz hinzugefügt",
      noteError: "Fehler beim Hinzufügen der Notiz",
    },
    
    // Dashboard
    dashboard: {
      welcome: "Willkommen",
      recentRequests: "Letzte Anfragen",
      pendingReview: "Ausstehende Überprüfung",
      totalRequests: "Anfragen insgesamt",
      acceptedRequests: "Akzeptiert",
      declinedRequests: "Abgelehnt",
      noRequestsYet: "Noch keine Anfragen",
      noRequestsToReview: "Keine Anfragen zur Überprüfung",
      submitFirstRequest: "Ihre erste Anfrage einreichen",
    },
    
    // Review
    review: {
      openRequests: "Offene Anfragen",
      selectPriority: "Wählen Sie eine Prioritätsstufe aus",
      submitToAdmin: "An Admin übermitteln",
      supportNotes: "Support-Notizen",
      adminNotes: "Admin-Notizen",
      declineReason: "Ablehnungsgrund",
      accept: "Akzeptieren",
      decline: "Ablehnen",
      returnToSupport: "Zurück an Support",
      moreInfoNeeded: "Mehr Infos benötigt",
      new: "Neu",
      waitingForDecision: "Warten auf Entscheidung",
      noRequestsPending: "Keine Anfragen zur Überprüfung ausstehend",
      allProcessed: "Alle Anfragen wurden bearbeitet.",
      accepted: "Anfrage akzeptiert!",
      declined: "Anfrage abgelehnt",
      returnedToSupport: "Zurück an Support",
    },
    
    // Analytics
    analytics: {
      title: "Analyse-Dashboard",
      requestsByStatus: "Anfragen nach Status",
      requestsByCategory: "Anfragen nach Kategorie",
      requestsByPriority: "Anfragen nach Priorität",
      requestsOverTime: "Anfragen im zeitlichen Verlauf",
      avgProcessingTime: "Durchschn. Bearbeitungszeit",
      days: "Tage",
    },
    
    // Categories
    categories: {
      title: "Kategorien verwalten",
      addNew: "Neue Kategorie",
      name: "Name",
      description: "Beschreibung",
      color: "Farbe",
      requestCount: "Anfragen",
      noCategories: "Noch keine Kategorien",
      created: "Kategorie erstellt!",
      updated: "Kategorie aktualisiert!",
      deleted: "Kategorie gelöscht!",
    },
    
    // Login/Signup
    auth: {
      login: "Anmelden",
      signup: "Registrieren",
      email: "E-Mail-Adresse",
      password: "Passwort",
      confirmPassword: "Passwort bestätigen",
      name: "Vollständiger Name",
      rememberMe: "Angemeldet bleiben",
      forgotPassword: "Passwort vergessen?",
      noAccount: "Sie haben kein Konto?",
      haveAccount: "Haben Sie bereits ein Konto?",
      loginError: "Ungültige Anmeldeinformationen",
      signupError: "Registrierung fehlgeschlagen",
    },
    
    // Help
    help: {
      title: "Hilfe & Leitfaden",
      overview: "Übersicht",
      overviewText: "Mit FeatureHub können Sie Funktionsanfragen einreichen, überprüfen und verfolgen.",
      yourRole: "Ihre Rolle",
      workflowTitle: "Wie funktioniert das?",
      workflowSteps: [
        { step: "1. Einreichung", desc: "Ein Benutzer reicht eine Funktionsanfrage mit Titel, Beschreibung und geschäftlicher Begründung ein." },
        { step: "2. Support", desc: "Der Produktsupport überprüft die Anfrage und leitet sie weiter." },
        { step: "3. Admin", desc: "Der Produkt-Admin trifft die endgültige Entscheidung." },
      ],
      rolesTitle: "Rollen erklärt",
      roleDescriptions: {
        USER: "Sie können neue Funktionsanfragen einreichen und Ihre eigenen Anfragen verfolgen.",
        SUPPORT: "Sie überprüfen eingereichte Anfragen und leiten diese weiter.",
        ADMIN: "Sie treffen die endgültige Entscheidung über Funktionsanfragen.",
        VIEWER: "Sie haben Lesezugriff auf das Dashboard.",
      },
      tipsTitle: "Nützliche Tipps",
      tips: [
        "Verwenden Sie KI für bessere Formulierungen.",
        "Fügen Sie detaillierte Screenshots hinzu.",
        "Achten Sie auf das Sprachen-Umschaltwerkzeug."
      ],
      statusTitle: "Statusübersicht",
      statusDescriptions: {
        SUBMITTED: "Wartet auf Überprüfung.",
        UNDER_REVIEW: "Vom Support an Admin weitergeleitet.",
        FINAL_REVIEW: "Admin entscheidet.",
        ACCEPTED: "Die Anfrage wurde genehmigt.",
        DECLINED: "Die Anfrage wurde abgelehnt.",
        RETURNED: "Die Anfrage benötigt Klärung.",
      },
    },

    // Landing page
    landing: {
      title: "FeatureHub",
      subtitle: "Verfolgen und erstellen Sie mühelos Produktanfragen",
      getStarted: "Jetzt starten",
      learnMore: "Mehr erfahren",
    },
  },
};

export type Language = keyof typeof translations;
export type Translations = typeof translations.nl;
