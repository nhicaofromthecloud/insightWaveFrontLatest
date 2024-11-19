import { useQuery } from '@tanstack/react-query';
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

// The useReviews hook that accepts endpoint, method, email, and data (for POST)
export const useReviews = ({
  endpoint,
  method = 'GET',
  email = '',
  data = null,
  accessToken
}) => {
  return useQuery({
    queryKey: ['reviews', { endpoint, method, email, data, accessToken }],
    queryFn: fetchData,
    enabled: !!endpoint // Ensures the query only runs when an endpoint is provided
  });
};
