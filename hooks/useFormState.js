import { useState, useCallback } from 'react';

export const useFormState = (initialState) => {
  const [data, setData] = useState(initialState);
  
  const updateField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const updateMultipleFields = useCallback((updates) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);
  
  const resetForm = useCallback(() => {
    setData(initialState);
  }, [initialState]);
  
  return {
    data,
    updateField,
    updateMultipleFields,
    resetForm
  };
};

export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState({
    categories: false,
    location: false,
    otp: false,
    submit: false
  });
  
  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const isLoading = Object.values(loadingStates).some(Boolean);
  
  return {
    loadingStates,
    setLoading,
    isLoading
  };
};