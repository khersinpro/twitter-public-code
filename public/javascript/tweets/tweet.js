window.addEventListener('DOMContentLoaded', () => {
    bindTweet()
    commentTweet()
    likeDislike()
    getTweetComs()
})

//************* Requetes axios pour toute la page *************//
// Récupération des tous les commentaires d'un tweet
const getAllComFromAxios = async (tweetId) => {
    let data
    await axios.get(`/tweets/coms/getcoms/${tweetId}`)
    .then(res => data = res.data.comments )
    .catch(err => console.log(err))
    return data;
}
// Envoie d'un nouveau commentaire
const sendNewComAxios = async (tweetId , commentValue) => {
    let data;
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content') || "";
    await axios.post('/tweets/coms/newcom/'+ tweetId, {
        commentValue 
    },{headers: {'CSRF-Token': csrfToken}})
    .then(res => data = res.data )
    .catch(err => alert('Une erreur s\'est produite'))
    return data;
}
// Envoie ou retrait d'un like
const likeOrDislikeTweetAxios = async (tweetId) => {
    let data;
    await axios.get(`/tweets/like/${tweetId}`)
    .then(res => data = res.data)
    .catch(err => console.log(err))
    return data
}
// Suppression d'un post et retour de la liste des tweet
const deleteAndHandleNewTweetListAxios = async (tweetId) => {
    let data;
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content') || "";
    await axios.delete(`/tweets/${tweetId}`,{headers: {'CSRF-Token': csrfToken}})
    .then(res => data = res.data)
    .catch(err => console.log(err))
    return data;
}

//************* Fonctions pour les commentaires d'un tweet *************//

// Fonction de supression de tweet
const bindTweet = () => {
    let elements = document.querySelectorAll('.btn-delete');
    const tweetContainer = document.getElementById('tweet-list-container')

    elements.forEach(element => {
        element.addEventListener("click", async event => {
            const tweetId = event.target.getAttribute("tweetid"); // Permet de recuperer l'attribut ajouté dans le html
            const data = await deleteAndHandleNewTweetListAxios(tweetId)
            tweetContainer.innerHTML = data;
            // recursivité de la fonction pour rafraichir les selecteurs des boutons
            bindTweet()
            commentTweet()
            likeDislike()
            getTweetComs()
        })
    })
}

// Fonction pour selectionner les inputs/buttons d'envoi de new com
const commentTweet = () => {
    let inputBtn = document.querySelectorAll('.new-com-btn');
    let inputValue = document.querySelectorAll('.new-com-input');
    let commentBtns = document.querySelectorAll('.tweet-stats-coms');

    commentBtns.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.tweet-card').querySelector('.new-com-input').focus();
        })
    })

    inputBtn.forEach(button => {
        button.addEventListener('click', (e) => {
            sendNewComAndOpenComContainer(e, button , true);
        })
    })

    inputValue.forEach(input => {
        input.addEventListener('keyup', async e  => {
            if(e.code === "Enter" || e.code === "NumpadEnter" || e.keyCode==13 ){
                sendNewComAndOpenComContainer(e, input, false)
            }
        })
    })
}

// Fonction d'envoie de commentaire et d'ouverture du container des commentaires
const sendNewComAndOpenComContainer = async (event, activate, button) => {
    const tweetId = event.target.getAttribute('tweetid');
    let containerComs = activate.closest('.tweet-card').querySelector('.com-container');     // selecteur du container des commentaires
    let nbOfcoms = activate.closest('.tweet-card').querySelector('.coms-length');            // selecteur du bouton d'ouverture des com + affiche du nombre des coms
    let commentValue ;
    let selectedInput;

    if(button){
        selectedInput = activate.closest('.tweet-card').querySelector('.new-com-input');
        commentValue = selectedInput.value;
    } else {
        commentValue = event.target.value;
    }

    if(commentValue.length > 0){
        const newComRes = await sendNewComAxios(tweetId, commentValue)                       // Récupération du nouveau com et du nombre total de coms

        // Si les infos du container ont deja été recupéré on ajoute le newcom et on ouvre les coms
        if(containerComs.classList.contains('fetched')){
                if(newComRes.newComs.length){

                    if(containerComs.classList.contains('hidden')){                          // Si le com container est hidden 
                        containerComs.classList.remove('hidden');                            // On lui retire la classe pour l'afficher
                    } 
                    nbOfcoms.textContent = `${newComRes.nbofcoms} commentaires`               // Rafraichissement du nombre de coms
                    newComRes.newComs.map(com => containerComs.innerHTML += displayComs(com)) // InnertHTML du nouveau commentaire
                    containerComs.lastElementChild.scrollIntoView({block: "center"})
                }
        // Si les infos du container n'ont pas été recupéré, on les recupére + affichage        
        } else {
                const commentArray = await getAllComFromAxios(tweetId);                       // Récupération des tous les coms du tweet
                if(commentArray.length){
                    containerComs.classList.add('fetched')                                    // Add la class fetched pour signaler que les coms sont deja recupéré
                    nbOfcoms.classList.add('clicked');                                        // Ajout de .clicked pour eviter de rechercher a nouveau tous les coms
                    nbOfcoms.textContent = `${commentArray.length} commentaires`;
                    containerComs.innerHTML = "";
                    commentArray.map(com => containerComs.innerHTML += displayComs(com))      // Map des coms recupéré
                    containerComs.lastElementChild.scrollIntoView({block: "center"})
                }
        }
    }
    // remet la value de l'input a "" aprés l'envoie
    if(button){
        selectedInput.value = "";
    } else {
        activate.value = "";
    }
}

// Récupérer les commentaire puis afficher les coms au click
const getTweetComs = () => {
    let displayTweetsBtns = document.querySelectorAll('.tweet-card .coms-length');
    let tweetId;
    
    displayTweetsBtns.forEach(button => {
        button.addEventListener("click", async  e => {
            tweetId = button.closest('.tweet-card').getAttribute('tweetid');
            let selectedContainer = button.closest('.tweet-card').querySelector('.com-container');
            if(tweetId) {
                if(button.classList.contains('clicked')){    
                    if(selectedContainer.classList.contains('hidden')){
                        selectedContainer.classList.remove('hidden');
                        selectedContainer.lastElementChild.scrollIntoView({block: "center"})
                    } else {
                        selectedContainer.classList.add('hidden');
                    }
                } else {
                    button.classList.add('clicked');
                    selectedContainer.classList.add('fetched')
                    const commentArray = await getAllComFromAxios(tweetId);
                    if(commentArray.length) {
                        let nbOfcoms = button.closest('.tweet-card').querySelector('.coms-length');
                        nbOfcoms.textContent = `${commentArray.length} commentaires`
                        selectedContainer.innerHTML = "";
                        commentArray.map(com => selectedContainer.innerHTML += displayComs(com))
                        selectedContainer.lastElementChild.scrollIntoView({block: "center"})
                    }
                }
            }
        })
    })
}

// HTML d'un commentaire
const displayComs = (com) => {
    const oneCom = `
            <div class="comment">
                <div class="comment-avatar-user">
                    <img src="${com.comAuthor.avatar}" alt="comment avatar" />
                </div>
                <div class="comment-data-container">
                    <p class="comment-data-pseudo">${com.comAuthorName}</p>
                    <p class="comment-data-text">${com.comContent}</p>
                    <p class="comment-data-date">le ${new Date(com.date).toLocaleDateString()} à ${new Date(com.date).toLocaleTimeString()} </p>
                </div>
            </div>
            `
            return oneCom
}

//************* Fonctions pour les likes d'un tweet *************//

// Like ou Dislike un tweet
const likeDislike = () => {
    let allBtnsLike = document.querySelectorAll(".tweet-stats-likes");
    allBtnsLike.forEach(button => {
        button.addEventListener('click', async e => {
            const tweetId = e.target.getAttribute('tweetid')
            const tweetCard = button.closest('.tweet-card').querySelector('.likes-length p')
            const handleData = await likeOrDislikeTweetAxios(tweetId);
            tweetCard.textContent = `${handleData.nboflikes} likes`

            if(handleData.data === 0) {
                button.innerHTML = `
                    <i class="fa-regular fa-heart"></i>
                    <p>J'aime</p>
                `
            } else {
                button.innerHTML = `
                    <i class="fa-solid fa-heart heart-liked"></i>
                    <p>Je n'aime plus</p>  
                `
            } 
        })
    })
}