document.addEventListener('DOMContentLoaded', () => {
    // Obtener todos los botones de acción
    const editButtons = document.querySelectorAll('.edit-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    // Agregar tooltips a los botones
    editButtons.forEach(btn => btn.setAttribute('data-tooltip', 'Editar'));
    viewButtons.forEach(btn => btn.setAttribute('data-tooltip', 'Ver detalles'));
    deleteButtons.forEach(btn => btn.setAttribute('data-tooltip', 'Eliminar'));

    // Manejar edición de usuario
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.cells[0].textContent;
            window.location.href = `nuevoAsignar.html?id=${userId}`;
        });
    });

    // Manejar vista de detalles
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.cells[0].textContent;
            const userName = row.cells[2].textContent;
            const userLastName = row.cells[3].textContent;
            const userEmail = row.cells[4].textContent;
            const userProfile = row.cells[5].textContent;
            const userStatus = row.cells[6].textContent;

            Swal.fire({
                title: 'Detalles del Usuario',
                html: `
                    <div style="text-align: left; padding: 20px;">
                        <p><strong>ID:</strong> ${userId}</p>
                        <p><strong>Nombre:</strong> ${userName}</p>
                        <p><strong>Apellido:</strong> ${userLastName}</p>
                        <p><strong>Email:</strong> ${userEmail}</p>
                        <p><strong>Perfil:</strong> ${userProfile}</p>
                        <p><strong>Estado:</strong> ${userStatus}</p>
                    </div>
                `,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#3085d6'
            });
        });
    });

    // Manejar eliminación de usuario
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.cells[0].textContent;
            const userName = row.cells[2].textContent;

            Swal.fire({
                title: '¿Está seguro?',
                text: `Se eliminará el usuario ${userName}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Aquí iría la llamada a la API para eliminar el usuario
                    // Por ahora solo mostramos un mensaje de éxito
                    Swal.fire(
                        '¡Eliminado!',
                        'El usuario ha sido eliminado.',
                        'success'
                    ).then(() => {
                        row.remove(); // Eliminamos la fila de la tabla
                    });
                }
            });
        });
    });

    // Manejar cierre de sesión
    const logoutLink = document.querySelector('.logout-link');
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        Swal.fire({
            title: '¿Está seguro?',
            text: "Se cerrará la sesión actual",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'index.html';
            }
        });
    });
});
