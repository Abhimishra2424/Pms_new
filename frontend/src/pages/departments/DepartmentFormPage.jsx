import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Alert, Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { departmentSchema } from '../../utils/validators';
import {
  createDepartmentStart, createDepartmentSuccess, createDepartmentFailure,
  updateDepartmentStart, updateDepartmentSuccess, updateDepartmentFailure,
} from '../../redux/slices/departmentSlice';
import { createDepartment, updateDepartment } from '../../api/companyApi';

export default function DepartmentFormPage({ open, onClose, department, companyId }) {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employee);
  const { departments } = useSelector((state) => state.department);

  const isEdit = Boolean(department);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(departmentSchema),
    defaultValues: { name: '', description: '', headId: '', parentDepartmentId: '' },
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name || '',
        description: department.description || '',
        headId: department.headId?._id || department.headId?.id || department.headId || '',
        parentDepartmentId: department.parentDepartmentId?._id || department.parentDepartmentId?.id || department.parentDepartmentId || '',
      });
    } else {
      reset({ name: '', description: '', headId: '', parentDepartmentId: '' });
    }
  }, [department, reset]);

  const handleFormSubmit = async (formData) => {
    const payload = { ...formData, companyId };

    if (isEdit) {
      dispatch(updateDepartmentStart());
      try {
        const { data } = await updateDepartment(department._id || department.id, payload);
        dispatch(updateDepartmentSuccess(data));
        toast.success('Department updated successfully');
        onClose();
      } catch (err) {
        dispatch(updateDepartmentFailure(err.response?.data?.message || err.message));
        toast.error(err.response?.data?.message || 'Failed to update department');
      }
    } else {
      dispatch(createDepartmentStart());
      try {
        const { data } = await createDepartment(payload);
        dispatch(createDepartmentSuccess(data));
        toast.success('Department created successfully');
        onClose();
      } catch (err) {
        dispatch(createDepartmentFailure(err.response?.data?.message || err.message));
        toast.error(err.response?.data?.message || 'Failed to create department');
      }
    }
  };

  const parentOptions = useMemo(() => {
    if (!departments) return [];
    const currentId = department?._id || department?.id;
    return departments.filter((d) => (d._id || d.id) !== currentId);
  }, [departments, department]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Department' : 'Add Department'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Department Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={3} error={!!errors.description} helperText={errors.description?.message} />
            )}
          />
          <Controller
            name="headId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Department Head" fullWidth>
                <MenuItem value="">None</MenuItem>
                {employees?.map((emp) => (
                  <MenuItem key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.firstName} {emp.lastName} {emp.email ? `(${emp.email})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="parentDepartmentId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Parent Department" fullWidth>
                <MenuItem value="">None</MenuItem>
                {parentOptions.map((dept) => (
                  <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isEdit ? 'Update' : 'Create'} Department
        </Button>
      </DialogActions>
    </Dialog>
  );
}
