window.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById("search-menu-container");
    const searchInput = document.getElementById('searchInput');
    if(menuContainer) {
        // permet de rendre d'enlever le html du container de recherche pour qu'il devienne invisible
        window.addEventListener('click', () => {
            menuContainer.innerHTML = "";
        })
        
        // Stop la propagation de l'event du dessus ce qui empeche la fermeture de la page de recherche si on click dessus
        menuContainer.addEventListener('click', e => {
            e.stopPropagation();
        })
    
        // Fonction de recherche d'utilisateur
        let ref; // declarer le ref hors de la fonction pour que cela fonctionne
        searchInput.addEventListener('input', e => {
            // si il y a un time out en cours (ref), efface le (clearTimeOut)
            // ça permet d'evnoyer uniqument une requete au back avec le nom d'utilisateur choisis 
            if(ref){
                clearTimeout(ref);
            }
            // Récupération des user qui correspondent a la value de l'input
            ref = setTimeout(() => {
                axios.get('/users/?search=' + e.target.value)
                    .then(response => {
                        menuContainer.innerHTML = response.data;
                    }).catch(err => console.log(err))
            }, 1500);
        })
    }
})