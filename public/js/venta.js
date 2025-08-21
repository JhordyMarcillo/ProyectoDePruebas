document.addEventListener('DOMContentLoaded', () => {
    const saleForm = document.getElementById('saleForm');
    const searchClientBtn = document.querySelector('.primary-btn');
    const addProductBtn = document.getElementById('addProductBtn');
    const addServiceBtn = document.getElementById('addServiceBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const itemsTableBody = document.getElementById('itemsTableBody');

    let items = [];

    // Buscar cliente
    searchClientBtn.addEventListener('click', async () => {
        const cedula = document.getElementById('cedula_cliente').value;
        if (!cedula) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor ingrese una cédula'
            });
            return;
        }

        try {
            const response = await axios.get(`/api/clientes/${cedula}`);
            const cliente = response.data;

            // Llenar los campos del cliente
            document.getElementById('nombre_cliente').value = cliente.nombre;
            document.getElementById('apellido_cliente').value = cliente.apellido;
            document.getElementById('cedula_display').value = cliente.cedula;
            document.getElementById('numero_cliente').value = cliente.numero;
            document.getElementById('email_cliente').value = cliente.email;
            document.getElementById('locacion_cliente').value = cliente.locacion;
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Cliente no encontrado'
            });
        }
    });

    // Añadir producto
    addProductBtn.addEventListener('click', () => {
        const producto = document.getElementById('producto');
        const cantidad = document.getElementById('cantidad_producto');

        if (!producto.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor seleccione un producto'
            });
            return;
        }

        addItem('producto', producto.options[producto.selectedIndex].text, cantidad.value);
        producto.value = '';
        cantidad.value = '1';
    });

    // Añadir servicio
    addServiceBtn.addEventListener('click', () => {
        const servicio = document.getElementById('servicio');
        const cantidad = document.getElementById('cantidad_servicio');

        if (!servicio.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor seleccione un servicio'
            });
            return;
        }

        addItem('servicio', servicio.options[servicio.selectedIndex].text, cantidad.value);
        servicio.value = '';
        cantidad.value = '1';
    });

    // Función para añadir item a la tabla
    function addItem(tipo, descripcion, cantidad) {
        const item = {
            tipo,
            descripcion,
            cantidad: parseInt(cantidad),
            precioUnitario: 0, // Esto debería venir de la base de datos
            subtotal: 0
        };

        items.push(item);
        updateTable();
        calculateTotal();
    }

    // Actualizar tabla
    function updateTable() {
        itemsTableBody.innerHTML = '';
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.tipo}</td>
                <td>${item.descripcion}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precioUnitario.toFixed(2)}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
                <td>
                    <i class="fas fa-trash delete-item" data-index="${index}"></i>
                </td>
            `;
            itemsTableBody.appendChild(row);
        });

        // Agregar listeners para eliminar items
        document.querySelectorAll('.delete-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                items.splice(index, 1);
                updateTable();
                calculateTotal();
            });
        });
    }

    // Calcular total
    function calculateTotal() {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const iva = parseFloat(document.getElementById('iva').value) / 100;
        const total = subtotal * (1 + iva);
        document.getElementById('total').value = total.toFixed(2);
    }

    // Cancelar venta
    cancelBtn.addEventListener('click', () => {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'Se perderán todos los datos ingresados',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, mantener'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'ventas.html';
            }
        });
    });

    // Guardar venta
    saleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!document.getElementById('cedula_cliente').value) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor busque un cliente primero'
            });
            return;
        }

        if (items.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe agregar al menos un producto o servicio'
            });
            return;
        }

        try {
            const ventaData = {
                cliente: document.getElementById('cedula_cliente').value,
                items: items,
                total: parseFloat(document.getElementById('total').value),
                iva: parseFloat(document.getElementById('iva').value)
            };

            await axios.post('/api/ventas', ventaData);

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Venta registrada correctamente',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = 'ventas.html';
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al registrar la venta'
            });
        }
    });
});
