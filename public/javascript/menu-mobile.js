window.addEventListener('DOMContentLoaded', () => {
    // logique d'ouverture du profil
    const openProfil = document.getElementById('btn-open-menu');
    const profil = document.querySelector('.profile-container');

    openProfil.addEventListener('click', e  => {
        chatList.classList.contains('switch-chat-list') && chatList.classList.remove('switch-chat-list');
        profil.classList.toggle('profile-open')
    })

    // Logique d'ouverture de conversation
    const openRooms = document.getElementById('btn-open-chat');
    const chatList = document.querySelector('.chat-list');

    openRooms.addEventListener('click', () => {
        profil.classList.contains('profile-open') && profil.classList.remove('profile-open');
        chatList.classList.toggle('switch-chat-list');
        console.log(chatList);
    })
})