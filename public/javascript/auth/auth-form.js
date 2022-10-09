window.addEventListener('DOMContentLoaded', () => {
    const forgot = document.getElementById('forgot');

    // Fonction d'ouverture du modal de recupération de mot de passe au clic avec la librairie sweet alert
    if(forgot){
        forgot.addEventListener('click', (e) => {
        const { value: email } = Swal.fire({
            title: 'Renseignez votre email',
            input: 'email',
            inputPlaceholder: 'Email'
            })
            .then(results => {
                const email = results.value;
                if(email){
                    axios.post('/users/forgot-password', {
                        email
                    })
                    .then(res => {
                        console.log(res);
                        Swal.fire({
                            icon: "sucess",
                            title: `Un email a était envoyé a : ${email}`
                        })
                    })
                    .catch(e => {
                        console.log(e);
                        Swal.fire({
                            icon: "error",
                            title: e.response.data
                        })
                    }) 
                }
            })
        })
    }
})