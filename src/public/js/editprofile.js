function editProfile(username, name, email, phone) {
  const editFields = document.getElementById(`edit-fields-${username}`);
  editFields.style.display = 'block';
  
  document.getElementById(`edit-name-${username}`).value = name;
  document.getElementById(`edit-email-${username}`).value = email;
  document.getElementById(`edit-phone-${username}`).value = phone;
  const passwordFields = document.getElementById(`password-fields-${username}`);
  passwordFields.style.display = 'none';
}
function editPassword(username) {
  const passwordFields = document.getElementById(`password-fields-${username}`);
  passwordFields.style.display = 'block';
  const editFields = document.getElementById(`edit-fields-${username}`);
  editFields.style.display = 'none';
} 
function updateProfile(username) {
  const name = document.getElementById(`edit-name-${username}`).value;
  const email = document.getElementById(`edit-email-${username}`).value;
  const phone = document.getElementById(`edit-phone-${username}`).value;

  const data = { name, email, phone };

  fetch('/v1/UpdateProfile', {  // Ensure the endpoint matches the server setup
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Profile updated successfully') {
      alert('Cập nhật thông tin thành công!');
      document.getElementById(`user-info-${username}`).querySelector('#name').innerText = name;
      document.getElementById(`user-info-${username}`).querySelector('#email').innerText = email;
      document.getElementById(`user-info-${username}`).querySelector('#phone').innerText = phone;

      document.getElementById(`user-info-${username}`).style.display = 'block';
      document.getElementById(`edit-fields-${username}`).style.display = 'none';
    } else {
      alert('Lỗi khi cập nhật thông tin!');
    }
  })
  .catch(error => console.error('Lỗi:', error));
}

function updatePassword(username) {
  const currentPassword = document.getElementById(`current-password-${username}`).value;
  const newPassword = document.getElementById(`edit-password-${username}`).value;
  const confirmPassword = document.getElementById(`confirm-password-${username}`).value;

  if (newPassword !== confirmPassword) {
    alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
    return;
  }

  const data = { username, currentPassword, newPassword };

  fetch('/v1/UpdatePassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Cập nhật mật khẩu thành công!');
      document.getElementById(`current-password-${username}`).value = '';
      document.getElementById(`edit-password-${username}`).value = '';
      document.getElementById(`confirm-password-${username}`).value = '';
      document.getElementById(`password-fields-${username}`).style.display = 'none';
    } else {
      alert('Lỗi khi cập nhật mật khẩu!');
    }
  })
  .catch(error => console.error('Lỗi:', error));
}


function cancelEditProfile(username) {
  const editFields = document.getElementById(`edit-fields-${username}`);
  const passwordFields = document.getElementById(`password-fields-${username}`);

  editFields.style.display = 'none';
  passwordFields.style.display = 'none';

  document.getElementById(`edit-name-${username}`).value = '';
  document.getElementById(`edit-email-${username}`).value = '';
  document.getElementById(`edit-phone-${username}`).value = '';
}
