window.addEventListener('DOMContentLoaded', () => {
    // Inscription
    const signupForm = document.querySelector('.auth-form');
    const emailInput = document.getElementById('email-auth-form');
    const passwordInput = document.getElementById('password-auth-form');
    //*** numeric and letter _ . - + numeric and letters min 2 max 10 + letters min 2 max 5 ***/
    const emailReg = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    //*** Minimum 12 characters, at least one uppercase letter, one lowercase letter, one number and one special character ***/
    const passwordReg = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-+])(?=\\S+$).{12,}$";
    let email = "";
    let password = "";

    // Email controller
    emailInput.addEventListener('input', e => {
        if(!e.target.value.match(emailReg)){
            document.querySelector('.email-error').textContent = 'Email incorrect'
        } else {
            document.querySelector('.email-error').textContent = ''
        }
        email = e.target.value;
    })
    
    // Password controller
    passwordInput.addEventListener('input', e => {
        if(!e.target.value.match(passwordReg)){
            document.querySelector('.password-error').textContent = 'Le mot de passe doit contenir 12 caractères et au minimum une majuscule, une minuscule, un caractère spécial et un chiffre.'
        } else {
            document.querySelector('.password-error').textContent = ''
        }
        password = e.target.value;
    })
    
    signupForm.addEventListener('submit', e  => {
        e.preventDefault();
        const validation = email.match(emailReg) && password.match(passwordReg);
        if(validation) {
            axios.post('/auth/signin', {email, password})
            .then(res => window.location = "/")
            .catch(err => {
                if(err.response.data.error) {
                    document.querySelector('.password-error').textContent = err.response.data.error
                } else {
                    console.log(err.response);
                }
            })
        } else {
            document.querySelector('.password-error').textContent = 'Le formulaire est mal remplis.'
        }
    })
})