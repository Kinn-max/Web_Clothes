/**
 * API Service Composable
 * Provides reusable HTTP methods with automatic token injection
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;
  const getAuthHeaders = (): HeadersInit => {
   const token =localStorage.getItem('token')
   return token ? {Authorization: `Bearer ${token}`}:{}    
  }

  const  get = <T>(path:string):Promise<T>=>
    $fetch<T>(`${baseURL}${path}`,{
      headers:getAuthHeaders(),
    })
  
  const post =<T>(path:string, body:unknown):Promise<T>=>
    $fetch<T>(`${baseURL}${path}`,{
      method:'POST',
      headers:{
        ...getAuthHeaders(),
        'content-type':'application/json'
      },
      body:JSON.stringify(body),
    })

  const put =<T>(path:string, body:unknown):Promise<T>=>
    $fetch<T>(`${baseURL}${path}`,{
      method:'PUT',
      headers:{
        ...getAuthHeaders(),
        'content-type':'application/json'
      },
      body:JSON.stringify(body),
    })
  
  const patch=<T>(path:string, body:unknown):Promise<T>=>
    $fetch<T>(`${baseURL}${path}`,{
      method:'PATCH',
      headers:{
        ...getAuthHeaders(),
        'content-type':'application/json'
      },
      body:JSON.stringify(body)
    })

  const del =<T>(path:string):Promise<T>=>
    $fetch<T>(`${baseURL}${path}`,{
      method:'DELETE',
      headers:getAuthHeaders(),
    })

  const upload=<T>(path:string, formData:FormData):Promise<T>=>
    $fetch<T>(`${baseURL}${path}`,{
      method:'POST',
      headers:getAuthHeaders(),
      body:formData
    })
  return {get, post , put, patch, del, upload};
};
