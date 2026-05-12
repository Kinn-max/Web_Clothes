export const useRequireAuth=()=>{
    const authStore= useAuthStore()
    //helper lấy userId, throw nếu chưa login
    const requireUserId=()=>{
        const userId= authStore.userId
        if(!userId) throw new Error('Chưa đăng nhập')
        return userId
    }
    //helper lấy userId dưới dạng int, throw nếu chưa login
    const requireUserIdInt=():number=>{
        return Number(requireUserId())
    }
    //helper kiểm tra đã login chưa, nếu chưa sẽ navigate đến trang login
    const requireAuthOrRedirect=():boolean=>{
        if(!authStore.userId){
            navigateTo('/login')
            return false
        }
        return true
    }
    //helper lấy userId nếu đã login, trả về null nếu chưa login
    const optionalUserId=():string| null=>{
        return authStore.userId
    }
    return{
        requireUserId,
        requireUserIdInt,
        requireAuthOrRedirect,
        optionalUserId,
        isAuthenticated: computed(()=>!!authStore.userId),
        userId:computed(()=>authStore.userId),
    }
}