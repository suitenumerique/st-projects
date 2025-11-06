import { useCallback, useState } from 'react';

export default (initialData) => {
  const [data, setData] = useState(initialData);

  const handleFieldChange = useCallback((event, { name: fieldName, value } = {}) => {
    const actualFieldName = fieldName || event.target.name;
    const actualValue = value !== undefined ? value : event.target.value;

    setData((prevData) => ({
      ...prevData,
      [actualFieldName]: actualValue,
    }));
  }, []);

  return [data, handleFieldChange, setData];
};
