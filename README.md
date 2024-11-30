
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Upload Platform</title>
    <!-- Supabase CDN -->
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .upload-container {
            text-align: center;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .video-container {
            display: grid;
            gap: 20px;
        }
        .upload-btn {
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }
        .upload-btn:hover {
            background-color: #45a049;
        }
        .progress-container {
            margin-top: 15px;
            display: none;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .progress {
            height: 100%;
            background-color: #4CAF50;
            width: 0%;
            transition: width 0.3s ease;
        }
        .video-wrapper {
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        video {
            width: 100%;
            border-radius: 4px;
        }
        .error-message {
            color: #ff0000;
            margin-top: 10px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="upload-container">
        <h1>Meine Video Platform</h1>
        <input type="file" id="fileInput" accept="video/*" style="display: none">
        <button id="uploadBtn" class="upload-btn">Video hochladen</button>
        <div id="progressContainer" class="progress-container">
            <div class="progress-bar">
                <div id="progress" class="progress"></div>
            </div>
        </div>
        <div id="errorMessage" class="error-message"></div>
    </div>

    <div id="videoContainer" class="video-container"></div>

    <script>
        // Supabase Konfiguration - beachte das "createClient" muss vom Supabase-Objekt aufgerufen werden
        const supabaseUrl = 'https://zchzwflaibfmlpxsuxas.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaHp3ZmxhaWJmbWxweHN1eGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMDQyNTksImV4cCI6MjA0ODU4MDI1OX0.D7W6N44mpRuWv8gpZTnydLEc34C2he6Eid-NvzKqR4w';
        
        // Hier war der Fehler - korrigierte Initialisierung
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

        // DOM Elemente
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        const progressContainer = document.getElementById('progressContainer');
        const progress = document.getElementById('progress');
        const errorMessage = document.getElementById('errorMessage');
        const videoContainer = document.getElementById('videoContainer');

        // Event Listener
        uploadBtn.addEventListener('click', () => {
            console.log('Button geklickt'); // Debug-Ausgabe
            fileInput.click();
        });
        
        fileInput.addEventListener('change', async (event) => {
            console.log('Datei ausgewählt');
            const file = event.target.files[0];
            if (!file) return;

            try {
                progressContainer.style.display = 'block';
                errorMessage.style.display = 'none';
                
                const cleanFileName = `${Date.now()}-${file.name
                    .replace(/[^a-zA-Z0-9.]/g, '_')
                    .replace(/\s+/g, '_')
                    .toLowerCase()}`;
                
                console.log('Starte Upload...', cleanFileName);
                
                const { data, error } = await supabaseClient.storage
                    .from('videos')
                    .upload(cleanFileName, file);

                if (error) throw error;

                console.log('Upload erfolgreich');

                const { data: { publicUrl } } = supabaseClient.storage
                    .from('videos')
                    .getPublicUrl(cleanFileName);

                addVideoToPage(publicUrl);
                
                // Reset UI
                progressContainer.style.display = 'none';
                progress.style.width = '0%';
                fileInput.value = '';
            } catch (error) {
                console.error('Upload error:', error);
                errorMessage.textContent = 'Fehler beim Upload: ' + error.message;
                errorMessage.style.display = 'block';
                progressContainer.style.display = 'none';
            }
        });

        function addVideoToPage(url) {
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';

            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.preload = 'metadata';

            wrapper.appendChild(video);
            videoContainer.insertBefore(wrapper, videoContainer.firstChild);
        }

        // Bestehende Videos laden
        async function loadExistingVideos() {
            try {
                const { data, error } = await supabaseClient.storage
                    .from('videos')
                    .list();

                if (error) throw error;

                for (const file of data) {
                    const { data: { publicUrl } } = supabaseClient.storage
                        .from('videos')
                        .getPublicUrl(file.name);
                    addVideoToPage(publicUrl);
                }
            } catch (error) {
                console.error('Error loading videos:', error);
                errorMessage.textContent = 'Fehler beim Laden der Videos: ' + error.message;
                errorMessage.style.display = 'block';
            }
        }

        // Lade existierende Videos beim Start
        loadExistingVideos();
    </script>
</body>
</html>
