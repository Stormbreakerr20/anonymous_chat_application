export const createAuthSlice = (set) => ({
    userInfo: null,
    socket: null,
    onlineUser: [],
    setUserInfo: (userInfo) => set({ userInfo }),
    setSocket: (socket) => set({ socket }),
    setOnlineUser: (onlineUser) => set({onlineUser}) ,   
});