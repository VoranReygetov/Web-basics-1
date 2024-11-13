$(function () {
    const socket = io();

    // Перевірка, чи є дані в sessionStorage
    const savedNickname = sessionStorage.getItem('userNickname');
    const savedRoom = sessionStorage.getItem('currentRoom');

    if (savedNickname && savedRoom) {
        $('#nickname').val(savedNickname);
        $('#room').val(savedRoom);
        joinRoom(savedNickname, savedRoom);
    }

    // Функція для приєднання до кімнати
    function joinRoom(nickname, room) {
        socket.emit('set nickname', nickname, room);
        
        // Зберігання даних в sessionStorage
        sessionStorage.setItem('userNickname', nickname);
        sessionStorage.setItem('currentRoom', room);
    }

    // Обробка кнопки "Приєднатися до кімнати"
    $('#joinRoom').click(function() {
        const userNickname = $('#nickname').val().trim();
        const currentRoom = $('#room').val().trim();

        if (userNickname && currentRoom) {
            joinRoom(userNickname, currentRoom);
            $('#errorMessage').hide();
        } else {
            $('#errorMessage').text('Будь ласка, введіть нікнейм і назву кімнати без пробілів').show();
        }
    });

    // Отримання та відображення повідомлень
    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    // Надсилання повідомлення в кімнату
    $('#messageForm').submit(function(e) {
        e.preventDefault();
        const message = $('#m').val().trim();

        // Перевірка на порожній рядок
        if (message !== '') {
            if (sessionStorage.getItem('currentRoom') && sessionStorage.getItem('userNickname')) {
                socket.emit('chat message', message);
                $('#m').val('');
            } else {
                alert('Спочатку приєднайтесь до кімнати');
            }
        }
    });
});
