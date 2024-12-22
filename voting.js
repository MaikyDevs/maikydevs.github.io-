// Erst den Supabase Client initialisieren
const supabaseClient = window.supabase.createClient(
    'https://zchzwflaibfmlpxsuxas.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaHp3ZmxhaWJmbWxweHN1eGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMDQyNTksImV4cCI6MjA0ODU4MDI1OX0.D7W6N44mpRuWv8gpZTnydLEc34C2he6Eid-NvzKqR4w'
);

// Vote Funktion
window.vote = async function(projectId) {
    try {
        if (localStorage.getItem('hasVoted')) {
            alert('Du hast bereits abgestimmt!');
            return;
        }

        const { error } = await supabaseClient.rpc('increment_vote', {
            project_id: projectId
        });

        if (error) throw error;

        localStorage.setItem('hasVoted', 'true');
        showVoteSuccess();
    } catch (error) {
        console.error('Fehler:', error);
        alert('Fehler beim Abstimmen. Bitte versuche es später erneut.');
    }
}

// Erfolgsmeldung
function showVoteSuccess() {
    const message = document.createElement('div');
    message.className = 'vote-success';
    message.textContent = 'Danke für deine Stimme!';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

// Reset-Funktion
window.resetVote = function() {
    localStorage.removeItem('hasVoted');
    alert('Deine Abstimmung wurde zurückgesetzt. Du kannst jetzt erneut abstimmen!');
}