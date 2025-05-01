document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.dataset.id;
            const cartId = 1; // Usa ID real o pásalo dinámicamente

            const confirm = await Swal.fire({
                title: '¿Eliminar producto?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (confirm.isConfirmed) {
                try {
                    const res = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success').then(() => {
                            location.reload();
                        });
                    } else {
                        throw new Error('No se pudo eliminar el producto');
                    }
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    });

    document.querySelectorAll('.update-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.dataset.id;
            const cartId = 1;

            const { value: quantity } = await Swal.fire({
                title: 'Modificar cantidad',
                input: 'number',
                inputLabel: 'Nueva cantidad',
                inputValue: 1,
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value || value <= 0) return 'Cantidad inválida';
                }
            });

            if (quantity) {
                try {
                    const res = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity })
                    });
                    if (res.ok) {
                        Swal.fire('Actualizado', 'Cantidad modificada correctamente', 'success').then(() => {
                            location.reload();
                        });
                    } else {
                        throw new Error('No se pudo actualizar');
                    }
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    });
});
