document.addEventListener('DOMContentLoaded', () => {
    const clientForm = document.getElementById('clientForm');
    const cancelBtn = document.querySelector('.cancel-btn');

    // Validación de cédula ecuatoriana
    function validarCedula(cedula) {
        if (!/^\d{10}$/.test(cedula)) return false;

        const digitos = cedula.split('').map(Number);
        const digitoVerificador = digitos.pop();
        let suma = 0;

        for (let i = 0; i < digitos.length; i++) {
            let valor = digitos[i];
            if (i % 2 === 0) {
                valor *= 2;
                if (valor > 9) valor -= 9;
            }
            suma += valor;
        }

        const total = Math.ceil(suma / 10) * 10;
        return (total - suma) === digitoVerificador;
    }

    // Validación de email
    function validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Validación de teléfono ecuatoriano
    function validarTelefono(telefono) {
        return /^(09|02|03|04|05|06|07)\d{8}$/.test(telefono);
    }

    // Cancelar registro
    cancelBtn.addEventListener('click', () => {
        Swal.fire({
            title: '¿Está seguro?',
            text: "Se perderán todos los datos ingresados",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, mantener'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'cliente.html';
            }
        });
    });

    // Enviar formulario
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener valores
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const email = document.getElementById('email').value.trim();
        const cedula = document.getElementById('cedula').value.trim();
        const telefono = document.getElementById('numero').value.trim();
        const genero = document.getElementById('genero').value;
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        const locacion = document.getElementById('locacion').value.trim();

        // Validaciones
        if (!nombres || !apellidos) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Los nombres y apellidos son obligatorios'
            });
            return;
        }

        if (!validarEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El email ingresado no es válido'
            });
            return;
        }

        if (cedula && !validarCedula(cedula)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La cédula ingresada no es válida'
            });
            return;
        }

        if (telefono && !validarTelefono(telefono)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El número de teléfono no es válido'
            });
            return;
        }

        try {
            const clienteData = {
                nombres,
                apellidos,
                email,
                cedula,
                telefono,
                genero,
                fechaNacimiento,
                locacion
            };

            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clienteData)
            });

            if (!response.ok) {
                throw new Error('Error al registrar el cliente');
            }

            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Cliente registrado correctamente',
                showConfirmButton: false,
                timer: 1500
            });

            window.location.href = 'cliente.html';
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al registrar el cliente'
            });
        }
    });

    // Validación en tiempo real
    document.getElementById('cedula').addEventListener('blur', function() {
        const cedula = this.value.trim();
        if (cedula && !validarCedula(cedula)) {
            this.classList.add('error');
            if (!this.nextElementSibling?.classList.contains('error-message')) {
                const errorMessage = document.createElement('span');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Cédula inválida';
                this.parentNode.appendChild(errorMessage);
            }
        } else {
            this.classList.remove('error');
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });

    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validarEmail(email)) {
            this.classList.add('error');
            if (!this.nextElementSibling?.classList.contains('error-message')) {
                const errorMessage = document.createElement('span');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Email inválido';
                this.parentNode.appendChild(errorMessage);
            }
        } else {
            this.classList.remove('error');
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });

    document.getElementById('numero').addEventListener('blur', function() {
        const telefono = this.value.trim();
        if (telefono && !validarTelefono(telefono)) {
            this.classList.add('error');
            if (!this.nextElementSibling?.classList.contains('error-message')) {
                const errorMessage = document.createElement('span');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Teléfono inválido';
                this.parentNode.appendChild(errorMessage);
            }
        } else {
            this.classList.remove('error');
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
});
