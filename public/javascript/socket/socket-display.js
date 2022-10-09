// Affichage des onglet de room
const createRoomItem = (room, _id) => {
    const container = document.querySelector('.allRooms-container');
    const contact = room.users.filter(user => user._id !== _id)
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="image-container-room" >
            <img src="${contact[0].avatar}" />
        </div>
        <p>${contact[0].username}</p>
    `;
    // Event pour crée la fenetre de conversation
    li.addEventListener('click', () => {
        createUserConversation(room._id, contact);
        openOrCloseRoomChat();                          // display room or tchat for mobile
    })
    container.append(li);
}

// Création de l'html d'un message et insertion dans la conversation voulu
const insertMessage = (messageContainer, contactName) => {
    const {authorName, message, room, updatedAt} = messageContainer;
    const chatWindow = document.getElementById(room);
    if(chatWindow) {
        const msgList = chatWindow.querySelector('.chat-box-messages');
        if(actualUsername === authorName){
            msgList.innerHTML += `
                <li class="chat-message user">
                    <p class="user-message">${message}</p>
                    <p class="chat-message-date">${new Date(updatedAt).toLocaleString()}</p>
                </li>
            ` 
        }else{
            msgList.innerHTML += `
                <li class="chat-message">
                    <p><strong>${authorName}</strong></p>
                    <p class="user-message">${message}</p>
                    <p class="chat-message-date">${new Date(updatedAt).toLocaleString()}</p>
                </li>
            ` 
        }
        msgList.scrollTo(0, msgList.scrollHeight);
    } else {
        // permet de d'ouvrir une page de conversation si elle n'est pas ouverte a la reception d'un msg
        ioClient.emit('openRoom', room) 
    }
}

// Ouverture de la fenetre de conversation
const createUserConversation = async (roomId, contact) => {
    const containerChat = document.getElementById('chat-windows');
    const chatExist = document.getElementById(roomId);
    let contactName = contact[0].username;

    // Récupération de l'historique de la conversation
    let history = [];
    await axios.get('/tweets//messagesroom/' + roomId)
    .then(data => history = data.data)
    .catch(e => console.log(e))

    if(!chatExist){
        // pour n'avoir qu'un chat ouvert
        if(window.matchMedia('(max-width: 992px)').matches){
            document.querySelectorAll('.chat-box').forEach(box => !box.classList.contains('reduce') && box.classList.add('reduce'));
            document.querySelectorAll('.chat-box-reduction').forEach(btn => !btn.classList.contains('rotate') && btn.classList.add('rotate')); 
        }

        containerChat.innerHTML +=
        `   <div class="chat-box" id=${roomId}>
                <div class="chat-box-user">
                    <div class="chat-box-userInfos">
                        <div class="chat-box-avatar">
                            <img src="${contact[0].avatar}" alt="user avatar" />
                        </div>    
                        <p>${contact[0].username}</p>
                    </div>
                    <div class="chat-box-btns">
                        <button class="chat-box-reduction" data-room=${roomId}>
                            <i class="fa-solid fa-chevron-up"></i>
                        </button>
                        <button class="chat-box-close" data-room=${roomId}>X</button>
                    </div>
                </div>
                <ul class="chat-box-messages"></ul>
                <div class="send-message-box">
                    <input type="text" class="send-input-value" room=${roomId} />
                    <button type="submit" class="send-message-button" room=${roomId} >Send</button>
                </div>
            </div>          
        ` 
        //Map de l'historique de la conversation
        if(history.length){
            history.map(message => insertMessage(message, contactName)) ;
        } 
        initButton()
    }
}

// Fonction d'envoie de message instantané
const sendMessage = (roomId, message) => {
    if(message.length){
        ioClient.emit('message', {roomId, text: message})
    }
}

// Fonction contenant toute la logique des boutons de page de conversation
const initButton = () => {
    let allSendMessageBtns = document.querySelectorAll('.send-message-button');  // tous les boutons d'envoie de message
    let allIConvInput = document.querySelectorAll('.send-input-value');          // section de tous les input de type text des input de conversation
    let allCloseBtns = document.querySelectorAll('.chat-box-close');             // Selection des tous les bouton de fermeture de conversation
    let allReduceBtns = document.querySelectorAll('.chat-box-reduction');        // Selection de tous les boutons de reduction de taille de conversation

    // fonction d'envoie de message au clic sur le bouton
    allSendMessageBtns.forEach(button => {
        button.addEventListener("click", e  => {
            const roomId = e.target.getAttribute("room");
            const input = document.getElementById(roomId).querySelector(".send-input-value");
            sendMessage(roomId, input.value)
            input.value = "";
        })
    })

    // fonction d'envoie de message en pressant le bouton "Enter"
    allIConvInput.forEach(input => {
        input.addEventListener('keyup', e  => {
            if(e.code === "Enter" || e.code === "NumpadEnter"){
                const roomId = e.target.getAttribute("room");
                sendMessage(roomId, e.target.value)
                e.target.value = "";
            }         
        })
    })

    // Fonction de fermeture d'une conversation au click 
    allCloseBtns.forEach(button => {
        button.addEventListener('click', e => {
            const roomId = e.target.getAttribute("data-room");
            document.getElementById(roomId).remove();
        })
    })

    // Fonction de reduction de taille d'une page de conversation
    allReduceBtns.forEach(button => {
        button.addEventListener('click', e => {
            const roomId = e.target.getAttribute("data-room");
            const msgBox = document.getElementById(roomId).querySelector('.chat-box-messages');

            if(window.matchMedia('(max-width: 992px)').matches){
                // pour avoir qu'un seul chat ouvert en mode responsive
                allReduceBtns.forEach(btn => { 
                    if(!btn.classList.contains('rotate') && btn !== button){
                        btn.classList.add('rotate')  
                    } 
                }) 
                document.querySelectorAll('.chat-box').forEach(box => {
                    if(!box.classList.contains('reduce') && box !== document.getElementById(roomId)){
                        box.classList.add('reduce');
                    }
                })
            } 
            button.classList.toggle("rotate");
            document.getElementById(roomId).classList.toggle('reduce');
            msgBox.scrollTo(0, msgBox.scrollHeight);
        })
    })
    // Réduction de la taille des container en mode mobile
}

// Fonction de control de room commune entre utilisateur
window.addEventListener('DOMContentLoaded', () => {
    const openChat = document.querySelector('.open-conversation');
    if(openChat){
        openChat.addEventListener('click', (e) => {
            const userChat = e.target.getAttribute("user");
            ioClient.emit('roomControl', userChat);
        })
    }

    // Event au clic pour sur les boutons d'ouverture de chat-box / room-box
    const roomContainerBtn = document.querySelector('.close-rooms-container');
    const chatContainerBtn = document.querySelector('.close-chats-list');
    
    roomContainerBtn.addEventListener('click', e => {
        openOrCloseRoomChat()
    })
    chatContainerBtn.addEventListener('click', e => {
        openOrCloseRoomChat()
    })
})

// fonction pour ouvrir uniquement l'un des deux container (room-list ou chat-list)
const openOrCloseRoomChat = () => {
    const roomContainer = document.querySelector('.allRooms-container');
    const chatContainer = document.getElementById('chat-windows');
    if(window.matchMedia('(max-width: 492px)').matches) {
        if(roomContainer.classList.contains('closeBox')){
            document.querySelector('.close-rooms-container').classList.remove("rotate-btn");
            document.querySelector('.close-chats-list').classList.add("rotate-btn");
            roomContainer.classList.remove('closeBox');
            chatContainer.classList.add('closeBox');
        } else if(chatContainer.classList.contains('closeBox')) {
            document.querySelector('.close-rooms-container').classList.add("rotate-btn");
            document.querySelector('.close-chats-list').classList.remove("rotate-btn");
            roomContainer.classList.add('closeBox');
            chatContainer.classList.remove('closeBox');
        } 
    }
}