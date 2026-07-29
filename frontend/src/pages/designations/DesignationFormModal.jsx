import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { designationSchema } from '../../utils/validators';
import {
  createDesignationStart, createDesignationSuccess, createDesignationFailure,
  updateDesignationStart, updateDesignationSuccess, updateDesignationFailure,
} from '../../redux/slices/designationSlice';
import { createDesignation, updateDesignation } from '../../api/companyApi';

export default function DesignationFormModal({ open, onClose, designation, companyId }) {
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.department);

  const isEdit = Boolean(designation);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(designationSchema),
    defaultValues: { title: '', description: '', departmentId: '', level: 0 },
  });

  useEffect(() => {
    if (designation) {
      reset({
        title: designation.title || '',
        description: designation.description || '',
        departmentId: designation.departmentId?._id || designation.departmentId?.id || designation.departmentId || '',
        level: designation.level ?? 0,
      });
    } else {
      reset({ title: '', description: '', departmentId: '', level: 0 });
    }
  }, [designation, reset]);

  const handleFormSubmit = async (formData) => {
    const payload = { ...formData, level: Number(formData.level), companyId };

    if (isEdit) {
      dispatch(updateDesignationStart());
      try {
        const { data } = await updateDesignation(designation._id || designation.id, payload);
        dispatch(updateDesignationSuccess(data));
        toast.success('Designation updated successfully');
        onClose();
      } catch (err) {
        dispatch(updateDesignationFailure(err.response?.data?.message || err.message));
        toast.error(err.response?.data?.message || 'Failed to update designation');
      }
    } else {
      dispatch(createDesignationStart());
      try {
        const { data } = await createDesignation(payload);
        dispatch(createDesignationSuccess(data));
        toast.success('Designation created successfully');
        onClose();
      } catch (err) {
        dispatch(createDesignationFailure(err.response?.data?.message || err.message));
        toast.error(err.response?.data?.message || 'Failed to create designation');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Designation Title" fullWidth required error={!!errors.title} helperText={errors.title?.message} />
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
            name="departmentId"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Department" fullWidth required error={!!errors.departmentId} helperText={errors.departmentId?.message}>
                <MenuItem value="">Select Department</MenuItem>
                {departments?.map((dept) => (
                  <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>{dept.name}</MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Hierarchy Level"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
                error={!!errors.level}
                helperText={errors.level?.message || 'Lower number = higher rank'}
              />
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
          {isEdit ? 'Update' : 'Create'} Designation
        </Button>
      </DialogActions>
    </Dialog>
  );
}
