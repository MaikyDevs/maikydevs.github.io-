
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Platform</title>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #4CAF50;
            --background-color: #f5f5f5;
            --card-background: white;
            --text-color: #333;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: var(--background-color);
            color: var(--text-color);
        }

        .header {
            text-align: center;
            padding: 20px;
            margin-bottom: 30px;
        }

        .upload-container {
            text-align: center;
            padding: 30px;
            background-color: var(--card-background);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .video-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
        }

        .video-card {
            background-color: var(--card-background);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }

        .video-card:hover {
            transform: translateY(-5px);
        }

        .video-wrapper {
            position: relative;
            padding-top: 56.25%; /* 16:9 Aspect Ratio */
        }

        .video-wrapper video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .video-info {
            padding: 15px;
        }

        .video-title {
            font-size: 1.2em;
            margin: 0 0 10px 0;
        }

        .video-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            border-top: 1px solid #eee;
        }

        .action-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            color: #666;
            transition: color 0.3s ease;
        }

        .action-btn:hover {
            color: var(--primary-color);
        }

        .upload-btn {
            padding: 12px 24px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .upload-btn:hover {
            background-color: #45a049;
            transform: translateY(-2px);
        }

        .comments-section {
            margin-top: 15px;
            padding: 15px;
            border-top: 1px solid #eee;
        }

        .comment-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 10px;
        }

        .delete-btn {
            color: #ff4444;
        }

        .delete-btn:hover {
            color: #cc0000;
        }

        .progress-container {
            margin-top: 15px;
            display: none;
        }

        .progress-bar {
            width: 100%;
            height: 10px;
            background-color: #f0f0f0;
            border-radius: 5px;
            overflow: hidden;
        }

        .progress {
            height: 100%;
            background-color: var(--primary-color);
            width: 0%;
            transition: width 0.3s ease;
        }

        .auth-container {
            text-align: right;
            padding: 15px 25px;
            background-color: var(--card-background);
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }

        .auth-btn {
            padding: 10px 20px;
            margin-left: 15px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            background-color: var(--primary-color);
            color: white;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .auth-btn:hover {
            background-color: #45a049;
            transform: translateY(-2px);
        }

        #userEmail {
            margin-right: 15px;
            color: var(--text-color);
            font-weight: 500;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--card-background);
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            width: 90%;
            max-width: 400px;
            text-align: center;
        }

        .modal-content h2 {
            margin-bottom: 25px;
            color: var(--text-color);
        }

        .modal-content input {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }

        .modal-content input:focus {
            border-color: var(--primary-color);
            outline: none;
        }

        .close-modal {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            transition: color 0.3s ease;
        }

        .close-modal:hover {
            color: var(--primary-color);
        }

        .comment {
            padding: 10px;
            border-bottom: 1px solid #eee;
            position: relative;
        }

        .comment strong {
            color: var(--primary-color);
            margin-bottom: 5px;
            display: block;
        }

        .comment p {
            margin: 5px 0;
        }

        .comment small {
            color: #666;
            font-size: 0.8em;
        }

        .delete-comment-btn {
            position: absolute;
            right: 10px;
            top: 10px;
            background: none;
            border: none;
            color: #ff4444;
            cursor: pointer;
            padding: 5px;
        }

        .delete-comment-btn:hover {
            color: #cc0000;
        }

        .comment-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 10px;
            font-size: 14px;
        }

        .comment-input:focus {
            border-color: var(--primary-color);
            outline: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Meine Video Platform</h1>
    </div>

    <div class="auth-container">
        <span id="userEmail"></span>
        <button id="loginBtn" class="auth-btn">Anmelden</button>
        <button id="registerBtn" class="auth-btn">Registrieren</button>
        <button id="logoutBtn" class="auth-btn" style="display: none;">Abmelden</button>
    </div>

    <div id="authModal" class="modal">
        <div class="modal-content">
            <h2 id="modalTitle">Anmelden</h2>
            <input type="email" id="emailInput" placeholder="E-Mail" required>
            <input type="password" id="passwordInput" placeholder="Passwort" required>
            <button id="submitAuthBtn" class="auth-btn">Bestätigen</button>
        </div>
    </div>

    <div class="upload-container">
        <input type="file" id="fileInput" accept="video/*" style="display: none">
        <button id="uploadBtn" class="upload-btn">
            <i class="fas fa-cloud-upload-alt"></i> Video hochladen
        </button>
        <div id="progressContainer" class="progress-container">
            <div class="progress-bar">
                <div id="progress" class="progress"></div>
            </div>
        </div>
    </div>

    <div id="videoContainer" class="video-container"></div>

    <script>
        const supabaseUrl = 'https://zchzwflaibfmlpxsuxas.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaHp3ZmxhaWJmbWxweHN1eGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMDQyNTksImV4cCI6MjA0ODU4MDI1OX0.D7W6N44mpRuWv8gpZTnydLEc34C2he6Eid-NvzKqR4w';
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        const progressContainer = document.getElementById('progressContainer');
        const progress = document.getElementById('progress');
        const videoContainer = document.getElementById('videoContainer');

        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const authModal = document.getElementById('authModal');
        const modalTitle = document.getElementById('modalTitle');
        const emailInput = document.getElementById('emailInput');
        const passwordInput = document.getElementById('passwordInput');
        const submitAuthBtn = document.getElementById('submitAuthBtn');
        const userEmail = document.getElementById('userEmail');

        let isLoginMode = true;

        // Auth-Status überprüfen
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (session) {
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'none';
                logoutBtn.style.display = 'inline-block';
                userEmail.textContent = session.user.email;
            } else {
                loginBtn.style.display = 'inline-block';
                registerBtn.style.display = 'inline-block';
                logoutBtn.style.display = 'none';
                userEmail.textContent = '';
            }
        });

        // Modal-Funktionen
        loginBtn.onclick = () => {
            isLoginMode = true;
            modalTitle.textContent = 'Anmelden';
            authModal.style.display = 'block';
        };

        registerBtn.onclick = () => {
            isLoginMode = false;
            modalTitle.textContent = 'Registrieren';
            authModal.style.display = 'block';
        };

        submitAuthBtn.onclick = async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                alert('Bitte füllen Sie alle Felder aus.');
                return;
            }

            submitAuthBtn.disabled = true;
            submitAuthBtn.textContent = 'Wird verarbeitet...';

            try {
                if (isLoginMode) {
                    const { error } = await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });
                    if (error) throw error;
                } else {
                    const { error } = await supabaseClient.auth.signUp({
                        email,
                        password
                    });
                    if (error) throw error;
                    alert('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails.');
                }
                authModal.style.display = 'none';
                emailInput.value = '';
                passwordInput.value = '';
            } catch (error) {
                alert(error.message);
            } finally {
                submitAuthBtn.disabled = false;
                submitAuthBtn.textContent = 'Bestätigen';
            }
        };

        logoutBtn.onclick = async () => {
            await supabaseClient.auth.signOut();
        };

        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                progressContainer.style.display = 'block';
                
                const title = prompt('Gib einen Titel für dein Video ein:') || 'Unbenanntes Video';
                const description = prompt('Beschreibe dein Video (optional):') || '';

                const fileName = `${Date.now()}-${file.name
                    .replace(/[^a-zA-Z0-9.]/g, '_')
                    .replace(/\s+/g, '_')
                    .toLowerCase()}`;

                const { data: uploadData, error: uploadError } = await supabaseClient.storage
                    .from('videos')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabaseClient.storage
                    .from('videos')
                    .getPublicUrl(fileName);

                const { data, error: videoError } = await supabaseClient
                    .from('videos')
                    .insert([
                        {
                            title,
                            description,
                            storage_path: fileName,
                            user_id: (await supabaseClient.auth.getUser()).data.user?.id
                        }
                    ])
                    .select();

                if (videoError) throw videoError;

                if (data && data[0]) {
                    addVideoToPage({
                        id: data[0].id,
                        url: publicUrl,
                        title,
                        description,
                        likes_count: 0
                    });
                } else {
                    throw new Error('Keine Daten vom Server erhalten');
                }

                progressContainer.style.display = 'none';
                progress.style.width = '0%';
                fileInput.value = '';
            } catch (error) {
                console.error('Upload error:', error);
                alert('Fehler beim Upload: ' + error.message);
                progressContainer.style.display = 'none';
            }
        });

        function addVideoToPage(video) {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-wrapper">
                    <video src="${video.url}" controls preload="metadata"></video>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p>${video.description}</p>
                </div>
                <div class="video-actions">
                    <button class="action-btn like-btn" onclick="toggleLike('${video.id}')">
                        <i class="far fa-heart"></i>
                        <span class="likes-count">${video.likes_count || 0}</span>
                    </button>
                    <button class="action-btn comment-btn" onclick="toggleComments('${video.id}')">
                        <i class="far fa-comment"></i> Kommentare
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteVideo('${video.id}')">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
                <div class="comments-section" id="comments-${video.id}" style="display: none;">
                    <input type="text" class="comment-input" placeholder="Kommentar schreiben und Enter drücken...">
                    <div class="comments-list"></div>
                </div>
            `;
            videoContainer.insertBefore(card, videoContainer.firstChild);
        }

        async function toggleLike(videoId) {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) {
                alert('Bitte melden Sie sich an, um Videos zu liken!');
                return;
            }

            try {
                const { data: existingLike } = await supabaseClient
                    .from('likes')
                    .select()
                    .eq('video_id', videoId)
                    .eq('user_id', user.id)
                    .single();

                if (existingLike) {
                    await supabaseClient
                        .from('likes')
                        .delete()
                        .eq('video_id', videoId)
                        .eq('user_id', user.id);
                } else {
                    await supabaseClient
                        .from('likes')
                        .insert([{ 
                            video_id: videoId,
                            user_id: user.id 
                        }]);
                }

                // Likes neu laden und anzeigen
                const { data: { likes_count } } = await supabaseClient
                    .from('videos')
                    .select('likes_count')
                    .eq('id', videoId)
                    .single();

                const likeBtn = document.querySelector(`[onclick="toggleLike('${videoId}')"]`);
                const likesCountSpan = likeBtn.querySelector('.likes-count');
                likesCountSpan.textContent = likes_count;
                
                // Icon aktualisieren
                const heartIcon = likeBtn.querySelector('i');
                heartIcon.className = existingLike ? 'far fa-heart' : 'fas fa-heart';
            } catch (error) {
                console.error('Like error:', error);
                alert('Fehler beim Liken: ' + error.message);
            }
        }

        async function toggleComments(videoId) {
            const commentsSection = document.getElementById(`comments-${videoId}`);
            
            if (commentsSection.style.display === 'none') {
                commentsSection.style.display = 'block';
                await loadComments(videoId);
                
                const commentInput = commentsSection.querySelector('.comment-input');
                commentInput.onkeypress = async (e) => {
                    if (e.key === 'Enter') {
                        const { data: { user } } = await supabaseClient.auth.getUser();
                        if (!user) {
                            alert('Bitte melden Sie sich an, um zu kommentieren!');
                            return;
                        }

                        // Benutzername aus dem localStorage holen oder eingeben lassen
                        let username = localStorage.getItem('username');
                        if (!username) {
                            username = prompt('Bitte geben Sie einen Benutzernamen ein:');
                            if (username) {
                                localStorage.setItem('username', username);
                            }
                        }

                        if (!username) return;

                        const content = commentInput.value.trim();
                        if (!content) return;

                        try {
                            const { error } = await supabaseClient
                                .from('comments')
                                .insert([{
                                    video_id: videoId,
                                    username: username,  // Hier verwenden wir username
                                    content: content
                                }]);

                            if (error) throw error;
                            await loadComments(videoId);
                            commentInput.value = '';
                        } catch (error) {
                            console.error('Comment error:', error);
                            alert('Fehler beim Kommentieren: ' + error.message);
                        }
                    }
                };
            } else {
                commentsSection.style.display = 'none';
            }
        }

        async function loadComments(videoId) {
            const commentsList = document.querySelector(`#comments-${videoId} .comments-list`);
            
            try {
                const { data: comments, error } = await supabaseClient
                    .from('comments')
                    .select('*')
                    .eq('video_id', videoId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                commentsList.innerHTML = comments.map(comment => `
                    <div class="comment">
                        <strong>@${comment.username}</strong>  // Hier zeigen wir den Benutzernamen an
                        <p>${comment.content}</p>
                        <small>${new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Error loading comments:', error);
                commentsList.innerHTML = '<p>Fehler beim Laden der Kommentare</p>';
            }
        }

        async function deleteComment(commentId, videoId) {
            if (!confirm('Möchten Sie diesen Kommentar wirklich löschen?')) return;

            try {
                const { error } = await supabaseClient
                    .from('comments')
                    .delete()
                    .eq('id', commentId);

                if (error) throw error;

                await loadComments(videoId);
            } catch (error) {
                console.error('Delete comment error:', error);
                alert('Fehler beim Löschen des Kommentars: ' + error.message);
            }
        }

        async function deleteVideo(videoId) {
            if (!confirm('Möchtest du dieses Video wirklich löschen?')) return;

            try {
                const { error } = await supabaseClient
                    .from('videos')
                    .delete()
                    .eq('id', videoId);

                if (error) throw error;

                // Video-Element aus dem DOM entfernen
                const videoCard = document.querySelector(`[onclick="deleteVideo('${videoId}')"]`)
                    .closest('.video-card');
                videoCard.remove();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Fehler beim Löschen: ' + error.message);
            }
        }

        // Lade existierende Videos beim Start
        async function loadExistingVideos() {
            try {
                const { data: videos, error } = await supabaseClient
                    .from('videos')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                for (const video of videos) {
                    const { data: { publicUrl } } = supabaseClient.storage
                        .from('videos')
                        .getPublicUrl(video.storage_path);

                    addVideoToPage({
                        id: video.id,
                        url: publicUrl,
                        title: video.title,
                        description: video.description,
                        likes_count: video.likes_count
                    });
                }
            } catch (error) {
                console.error('Error loading videos:', error);
            }
        }

        loadExistingVideos();

        // Auth-Modal schließen wenn außerhalb geklickt wird
        window.onclick = (event) => {
            if (event.target === authModal) {
                authModal.style.display = 'none';
                emailInput.value = '';
                passwordInput.value = '';
            }
        };

        // Fügen Sie einen Close-Button zum Modal hinzu
        const modalContent = document.querySelector('.modal-content');
        modalContent.insertAdjacentHTML('afterbegin', '<span class="close-modal">&times;</span>');
        const closeModal = document.querySelector('.close-modal');
        closeModal.onclick = () => {
            authModal.style.display = 'none';
            emailInput.value = '';
            passwordInput.value = '';
        };

        // Enter-Taste im Modal unterstützen
        [emailInput, passwordInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitAuthBtn.click();
                }
            });
        });
    </script>
</body>
</html>
