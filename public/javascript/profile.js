// Modify avatar
window.addEventListener('DOMContentLoaded', () => {
    const inputAvatar = document.getElementById('input-avatar');
    const formData = document.getElementById('form-container');
    
    formData.addEventListener('click', (e) => {
        inputAvatar.click();
    });

    inputAvatar.addEventListener('change', (e) => {
        formData.submit();
    });
});