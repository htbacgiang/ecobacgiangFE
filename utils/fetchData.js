// Get API base URL from environment variable
// Use NEXT_PUBLIC_API_SERVER_URL for Server API
const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
  if (!apiUrl) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ NEXT_PUBLIC_API_SERVER_URL chưa được set. Đang dùng localhost cho development.');
      return 'http://localhost:5000/api';
    }
    throw new Error('NEXT_PUBLIC_API_SERVER_URL is not defined. Please set it in your .env file.');
  }
  return apiUrl;
};

const baseUrl = getApiBaseUrl();

export const getData = async (url, token) => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });

  const data = await res.json();
  return data;
};

export const postData = async (url, post, token) => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(post),
  });

  const data = await res.json();
  return data;
};

export const putData = async (url, post, token) => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(post),
  });

  const data = await res.json();
  return data;
};

export const patchData = async (url, post, token) => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(post),
  });

  const data = await res.json();
  return data;
};

export const deleteData = async (url, token) => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  const data = await res.json();
  return data;
};
