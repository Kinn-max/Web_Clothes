import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp)=>{
    const queryClient= new QueryClient({
        defaultOptions:{
            queries:{
                refetchOnWindowFocus:false, // SPA, no need to refetch when window regains focus
                retry:1,// retry failed requests once, avoid infinite loops on persistent errors
                staleTime: 1000 * 60 * 5,//cache data for 5 minutes, avoid unnecessary refetches
            },
        },
    })
    nuxtApp.vueApp.use(VueQueryPlugin,{queryClient})
})
