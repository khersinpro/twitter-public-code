window.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('tweet-new-image');
    const imagePreview = document.getElementById('file-preview');
    const form = document.getElementById('tweet-form-sub');

    // affichage de l'image dans le formulaire
    imageInput.addEventListener('change', e => {
        imagePreview.src = URL.createObjectURL(imageInput.files[0]);
    })

    form.addEventListener('submit', e => {
        e.preventDefault()
        const textValue = form.querySelector('.tweet-form-textarea').value;
        const imageToUpload = imageInput.files[0];

        if(textValue.length){
            const formData = new FormData();
            imageToUpload && formData.append('tweet-image', imageToUpload);
            textValue.length && formData.append('content', textValue);
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content') || "";

            axios.post('/tweets', formData, {headers: {'CSRF-Token': csrfToken}})
            .then(res => window.location  = res.data.redirect)
            .catch(err => {
                if(err.response.data.errors) {
                    form.querySelector('.error-list').innerHTML = ""
                    err.response.data.errors.map(error => form.querySelector('.error-list').innerHTML += `<li class="form-error">${error.msg}</li>`)
                } else if(err.response.data) {
                    form.querySelector('.error-list').innerHTML = ""
                    err.response.data.map(error => form.querySelector('.error-list').innerHTML += `<li class="form-error">${error}</li>`)
                } else {
                    console.log(err);
                }
            })
        } else {
            form.querySelector('.error-list').innerHTML = ""
            form.querySelector('.error-list').innerHTML = "<li class='form-error'>Le contenu du tweet est vide.</li>"
        }  
    })
})