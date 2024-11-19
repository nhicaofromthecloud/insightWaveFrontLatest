import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

// A flexible fetch function that accepts endpoint, method, and options
const fetchData = async ({ queryKey }) => {
  const [_key, { endpoint, method, email, data, accessToken }] = queryKey;

  // Create the URL based on the endpoint and email if provided
  const url = email ? `${endpoint}/${email}` : endpoint;

  // Make the Axios request based on the method and handle optional data for POST/PUT
  const response = await axios({
    url,
    method,
    data, // This is the body data, only used for POST/PUT requests
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  return response.data;
};

// The useCustomers hook that accepts endpoint, method, email, and data (for POST, PUT, DELETE)
export const useCustomers = ({
  endpoint,
  method = 'GET',
  email = '',
  data = null,
  accessToken
}) => {
  return useQuery({
    queryKey: ['customers', { endpoint, method, email, data, accessToken }],
    queryFn: fetchData,
    enabled: !!endpoint // Ensures the query only runs when an endpoint is provided
  });
};

// Hook for mutations like POST, PUT, DELETE
export const useCustomerMutation = ({
  endpoint,
  method,
  email,
  data,
  accessToken
}) => {
  return useMutation(() =>
    axios({
      url: email ? `${endpoint}/${email}` : endpoint,
      method,
      data, // Body data for POST/PUT requests
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
  );
};
