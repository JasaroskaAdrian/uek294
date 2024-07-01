# Task Manager

Eine einfache CRUD-Anwendung für ein Aufgaben-Management-System mit Permalinks und einer Benutzeroberfläche, die mit Tailwind CSS gestaltet ist.

## Projektstruktur

```
task-manager/
│
├── views/
│   └── tasks/
│       ├── index.html
│       ├── edit.html
│       └── show.html
│
└── server.js
```

## Aufgabenstellung

Erstellen Sie eine kleine CRUD-Anwendung für ein Aufgaben-Management-System. Jede Aufgabe hat einen Titel und eine Beschreibung. Die Anwendung sollte die folgenden Funktionen bieten:

1. Aufgaben erstellen, anzeigen, bearbeiten und löschen.
2. Eine Indexseite, die alle Aufgaben auflistet und die Möglichkeit bietet, neue Aufgaben zu erstellen.
3. Eine Bearbeitungsseite, um die Details einer Aufgabe zu ändern.
4. Eine Anzeigeseite, um die Details einer Aufgabe anzuzeigen.

## Installationsanleitung

1. **Projektverzeichnis erstellen und Node.js initialisieren:**

   ```sh
   mkdir task-manager
   cd task-manager
   npm init -y
   ```

2. **Express installieren:**

   ```sh
   npm install express
   ```

3. **Projektstruktur erstellen:**

   Erstellen Sie die Verzeichnisse und Dateien gemäß der obigen Projektstruktur.

4. **Server-Skript (`server.js`) erstellen:**

   Erstellen Sie die Datei `server.js` im Projektverzeichnis und fügen Sie den entsprechenden Code hinzu, um die CRUD-Operationen zu verwalten und die HTML-Dateien zu bedienen.

5. **HTML-Dateien erstellen:**

   Erstellen Sie die Dateien `index.html`, `edit.html` und `show.html` im Verzeichnis `views/tasks/` und fügen Sie den entsprechenden HTML-Code hinzu.

6. **Server starten:**

   Starten Sie den Server mit dem folgenden Befehl:

   ```sh
   node server.js
   ```

7. **Anwendung im Browser aufrufen:**

   Öffnen Sie Ihren Browser und navigieren Sie zu `http://localhost:3000`, um die Anwendung zu verwenden.

