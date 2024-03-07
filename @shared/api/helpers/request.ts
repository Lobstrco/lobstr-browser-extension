function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const { status, statusText } = response;
  const error: any = new Error(`${status}: ${statusText}`);
  error.response = response;
  return response.json().then((errorData) => {
    error.data = errorData;
    throw error;
  });
}

function request(method: string, url: string, options: any) {
  const fetchOptions = { method, ...options, ...{ credentials: "omit" } };
  return fetch(url, fetchOptions)
    .then(checkStatus)
    .then((response) => {
      if (response.status === 204) {
        return null;
      }
      return response.json();
    });
}

function get(url: string, options?: any) {
  return request("GET", url, options);
}

function deleteRequest(url: string, options?: any) {
  return request("DELETE", url, options);
}

const headers = { "Content-Type": "application/json" };

function post(url: string, options?: any) {
  return request("POST", url, { headers, ...options });
}

export { get, post, deleteRequest };
