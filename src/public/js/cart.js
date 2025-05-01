document.addEventListener('DOMContentLoaded', () => {
    const cartId = document.body.dataset.cartId || 1;

    const showAlert = (title, text, icon = 'success') => {
        return Swal.fire({ title, text, icon });
    };

    const reloadOnSuccess = (msg) => {
        return Swal.fire(msg, '', 'success').then(() => location.reload());
    };

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.dataset.id;

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
                        await reloadOnSuccess('Producto eliminado correctamente');
                    } else {
                        throw new Error('No se pudo eliminar el producto');
                    }
                } catch (err) {
                    showAlert('Error', err.message, 'error');
                }
            }
        });
    });

    document.querySelectorAll('.update-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.dataset.id;

            const { value: quantity } = await Swal.fire({
                title: 'Modificar cantidad',
                input: 'number',
                inputLabel: 'Nueva cantidad',
                inputValue: 1,
                showCancelButton: true,
                inputAttributes: {
                    min: 1,
                    step: 1
                },
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
                        await reloadOnSuccess('Cantidad modificada correctamente');
                    } else {
                        throw new Error('No se pudo actualizar');
                    }
                } catch (err) {
                    showAlert('Error', err.message, 'error');
                }
            }
        });
    });
});