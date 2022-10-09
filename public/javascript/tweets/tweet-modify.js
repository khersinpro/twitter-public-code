window.addEventListener('DOMContentLoaded', () => {
    const modifyForm = document.getElementById('tweet-form-modify')
    const imageContainer = document.querySelector('.modify-form-img');
    const deleteActualImg = document.getElementById('delete-actual-tweet-img');
    const imageInput = document.getElementById('tweet-new-image');
    const imagePreview = document.getElementById('file-preview');
    const tweetId = window.location.pathname.split('/').slice(-1)[0];
    let actualImgDeleted = false;


    // affichage de l'image dans le formulaire
    imageInput.addEventListener('change', e => {
        imagePreview.src = URL.createObjectURL(imageInput.files[0]);
        deleteActualImg.click()
    })

    // Supression de l'image du tweet
    if(deleteActualImg){
        deleteActualImg.addEventListener('click', e => {
            imageContainer.classList.add('hidden');
            actualImgDeleted = true
        })
    }

    modifyForm.addEventListener('submit', e => {
        e.preventDefault()

        const textValue = modifyForm.querySelector('.tweet-form-textarea').value;
        const imageToUpload = imageInput.files[0];
        
        if(textValue.length) {
            const formData = new FormData();
            imageToUpload && formData.append('tweet-image', imageToUpload);
            formData.append('deleteActualImg', actualImgDeleted)
            textValue.length && formData.append('content', textValue);
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content') || "";
            
            axios.post(`/tweets/update/${tweetId}`, formData, {headers: {'CSRF-Token': csrfToken}})
            .then(res => window.location = res.data.redirect )
            .catch(err => {
                if(err.response.data.errors) {
                    modifyForm.querySelector('.error-list').innerHTML = ""
                    err.response.data.errors.map(error => modifyForm.querySelector('.error-list').innerHTML += `<li class="form-error">${error.msg}</li>`)
                } else if(err.response.data){
                    modifyForm.querySelector('.error-list').innerHTML = ""
                    err.response.data.map(error => modifyForm.querySelector('.error-list').innerHTML += `<li class="form-error">${error}</li>`)
                } else {
                    console.log(err);
                }
            })
        } else {
            modifyForm.querySelector('.error-list').innerHTML = "";
            modifyForm.querySelector('.error-list').innerHTML = "<li class='form-error'>Le contenu du tweet est vide.</li>";
        }
    }) 
})