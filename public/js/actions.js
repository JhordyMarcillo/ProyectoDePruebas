// Función para cerrar sesión
function logout() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Está seguro que desea salir del sistema?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            window.location.href = 'index.html';
        }
    });
}

// Funciones para manejar acciones de CRUD
function editItem(id, type) {
    switch(type) {
        case 'usuario':
            window.location.href = `nuevoAsignar.html?edit=${id}`;
            break;
        case 'cliente':
            window.location.href = `nuevoCliente.html?edit=${id}`;
            break;
        case 'producto':
            window.location.href = `nuevoProducto.html?edit=${id}`;
            break;
        case 'servicio':
            window.location.href = `nuevoServicio.html?edit=${id}`;
            break;
        case 'proveedor':
            window.location.href = `nuevoProveedor.html?edit=${id}`;
            break;
        case 'venta':
            window.location.href = `nuevaVenta.html?edit=${id}`;
            break;
    }
}

function viewItem(id, type) {
    // Mostrar modal con detalles
    const modal = document.getElementById('viewModal');
    if (!modal) {
        createModal();
    }
    
    // Aquí normalmente harías una petición al backend para obtener los detalles
    // Por ahora simularemos con la información visible en la tabla
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        const data = {};
        row.querySelectorAll('td').forEach((td, index) => {
            const header = row.closest('table').querySelector(`th:nth-child(${index + 1})`);
            if (header) {
                data[header.textContent] = td.textContent;
            }
        });
        showDetails(data, type);
    }
}

function deleteItem(id, type) {
    Swal.fire({
        title: '¿Está seguro?',
        text: `Se eliminará este ${type}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.remove();
                Swal.fire({
                    title: 'Eliminado',
                    text: `${type} eliminado correctamente`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        }
    });
}

function toggleStatus(id, type) {
    const statusBadge = document.querySelector(`tr[data-id="${id}"] .status-badge`);
    if (statusBadge) {
        const currentStatus = statusBadge.classList.contains('active') ? 'activo' : 'inactivo';
        const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
        
        if (confirm(`¿Está seguro que desea cambiar el estado a ${newStatus}?`)) {
            statusBadge.classList.toggle('active');
            statusBadge.textContent = newStatus.toUpperCase();
            showToast(`Estado actualizado a ${newStatus}`);
        }
    }
}

// Funciones de utilidad
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'viewModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Detalles</h2>
            <div id="modalContent"></div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            border-radius: 8px;
            position: relative;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .close:hover {
            color: black;
        }
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #333;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            display: none;
            z-index: 1000;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Cerrar modal
    modal.querySelector('.close').onclick = function() {
        modal.style.display = "none";
    };
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

function showDetails(data, type) {
    let html = '<table class="details-table" style="width:100%;border-collapse:collapse;">';
    for (let [key, value] of Object.entries(data)) {
        if (key !== 'Acciones') {
            html += `<tr><th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;background-color:#f8f9fa">${key}</th>
                    <td style="padding:8px;text-align:left;border-bottom:1px solid #ddd">${value}</td></tr>`;
        }
    }
    html += '</table>';
    
    Swal.fire({
        title: 'Detalles del ' + type,
        html: html,
        width: '600px',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3085d6',
        showClass: {
            popup: 'animate__animated animate__fadeIn'
        }
    });
}

function showToast(message, type = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: type,
        title: message
    });
}

// Event Listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Agregar data-id a todas las filas de tablas
    document.querySelectorAll('table tr').forEach((row, index) => {
        if (index > 0) { // Saltamos el encabezado
            const id = row.cells[0].textContent;
            row.setAttribute('data-id', id);
        }
    });
    
    // Configurar los event listeners para los botones de acción
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.onclick = function() {
            const row = this.closest('tr');
            const id = row.getAttribute('data-id');
            const type = determineType(window.location.pathname);
            
            if (this.classList.contains('edit-btn')) {
                editItem(id, type);
            } else if (this.classList.contains('view-btn')) {
                viewItem(id, type);
            } else if (this.classList.contains('delete-btn')) {
                deleteItem(id, type);
            }
        };
    });
    
    // Configurar el botón de cerrar sesión
    const logoutBtn = document.querySelector('.logout-link');
    if (logoutBtn) {
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    }
});

function determineType(pathname) {
    if (pathname.includes('asignar')) return 'usuario';
    if (pathname.includes('cliente')) return 'cliente';
    if (pathname.includes('producto')) return 'producto';
    if (pathname.includes('servicio')) return 'servicio';
    if (pathname.includes('proveedor')) return 'proveedor';
    if (pathname.includes('venta')) return 'venta';
    return 'item';
}
