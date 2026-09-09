import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import AdminRoute from '@/components/admin/AdminRoute';
import apiService from '@/services/apiService.js';
import { useToast } from '@/contexts/ToastContext';

const emptyUser = {
  id: null,
  username: '',
  password: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  idTipoUsuario: 4,
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [user, setUser] = useState(emptyUser);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    const [usersData, tiposData] = await Promise.all([
      apiService.fetchUsers(),
      apiService.fetchLookupTipoUsuario(),
    ]);
    setUsers(usersData);
    setTiposUsuario(tiposData.map((t) => ({ label: t.valor, value: t.id })));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNew = () => {
    setUser(emptyUser);
    setIsEditing(false);
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setUser({
      id: rowData.id,
      username: rowData.username || '',
      password: '',
      nombre: rowData.nombre || '',
      apellido: rowData.apellido || '',
      email: rowData.email || '',
      telefono: rowData.telefono || '',
      idTipoUsuario: rowData.tipoUsuario || 4,
    });
    setIsEditing(true);
    setDialogVisible(true);
  };

  const confirmDelete = (rowData) => {
    setUserToDelete(rowData);
    setDeleteDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);
  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setUserToDelete(null);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    setUser((prev) => ({ ...prev, [name]: val }));
  };

  const onDropdownChange = (e, name) => {
    setUser((prev) => ({ ...prev, [name]: e.value }));
  };

  const saveUser = async () => {
    if (!user.username || !user.nombre || !user.apellido || !user.idTipoUsuario) {
      showError('Username, nombre, apellido y rol son requeridos');
      return;
    }

    if (!isEditing && !user.password) {
      showError('La contraseña es requerida para crear un usuario');
      return;
    }

    const payload = {
      username: user.username,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email || null,
      telefono: user.telefono || null,
      idTipoUsuario: user.idTipoUsuario,
    };

    if (!isEditing || user.password) {
      payload.password = user.password;
    }

    let result;
    if (isEditing) {
      result = await apiService.updateUser(user.id, payload);
    } else {
      result = await apiService.createUser(payload);
    }

    if (result.error) {
      showError(result.error);
      return;
    }

    showSuccess(isEditing ? 'Usuario actualizado' : 'Usuario creado');
    setDialogVisible(false);
    loadData();
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    const result = await apiService.deleteUser(userToDelete.id);
    if (result.error) {
      showError(result.error);
      return;
    }
    showSuccess('Usuario eliminado');
    setDeleteDialogVisible(false);
    setUserToDelete(null);
    loadData();
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm" onClick={() => openEdit(rowData)} />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(rowData)} />
    </div>
  );

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-check" onClick={saveUser} />
    </div>
  );

  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDialog} />
      <Button label="Sí" icon="pi pi-check" className="p-button-danger" onClick={deleteUser} />
    </div>
  );

  return (
    <AdminRoute>
      <div className="p-4">
        <div className="flex justify-content-between align-items-center mb-4">
          <h1 className="text-3xl font-bold m-0">Gestión de Usuarios</h1>
          <Button label="Nuevo Usuario" icon="pi pi-plus" onClick={openNew} />
        </div>

        <DataTable value={users} loading={loading} paginator rows={10} responsiveLayout="scroll">
          <Column field="username" header="Username" sortable />
          <Column field="nombre" header="Nombre" sortable />
          <Column field="apellido" header="Apellido" sortable />
          <Column field="email" header="Email" sortable />
          <Column field="tipoUsuarioNombre" header="Rol" sortable />
          <Column body={actionBodyTemplate} header="Acciones" style={{ width: '120px' }} />
        </DataTable>

        <Dialog visible={dialogVisible} onHide={hideDialog} header={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'} footer={dialogFooter} style={{ width: '450px' }} modal>
          <div className="flex flex-column gap-3">
            <div>
              <label className="block mb-2 font-medium">Username *</label>
              <InputText value={user.username} onChange={(e) => onInputChange(e, 'username')} className="w-full" disabled={isEditing} />
            </div>
            <div>
              <label className="block mb-2 font-medium">{isEditing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
              <Password
                value={user.password}
                onChange={(e) => onInputChange(e, 'password')}
                className="w-full"
                inputClassName="w-full"
                toggleMask
                feedback={false}
              />
            </div>
            <div className="grid">
              <div className="col-6">
                <label className="block mb-2 font-medium">Nombre *</label>
                <InputText value={user.nombre} onChange={(e) => onInputChange(e, 'nombre')} className="w-full" />
              </div>
              <div className="col-6">
                <label className="block mb-2 font-medium">Apellido *</label>
                <InputText value={user.apellido} onChange={(e) => onInputChange(e, 'apellido')} className="w-full" />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <InputText value={user.email} onChange={(e) => onInputChange(e, 'email')} className="w-full" />
            </div>
            <div>
              <label className="block mb-2 font-medium">Teléfono</label>
              <InputText value={user.telefono} onChange={(e) => onInputChange(e, 'telefono')} className="w-full" />
            </div>
            <div>
              <label className="block mb-2 font-medium">Rol *</label>
              <Dropdown value={user.idTipoUsuario} options={tiposUsuario} onChange={(e) => onDropdownChange(e, 'idTipoUsuario')} className="w-full" />
            </div>
          </div>
        </Dialog>

        <Dialog visible={deleteDialogVisible} onHide={hideDeleteDialog} header="Confirmar eliminación" footer={deleteDialogFooter} modal style={{ width: '350px' }}>
          <p>¿Estás seguro de que querés eliminar al usuario <strong>{userToDelete?.nombre} {userToDelete?.apellido}</strong>?</p>
        </Dialog>
      </div>
    </AdminRoute>
  );
};

export default AdminUsersPage;
